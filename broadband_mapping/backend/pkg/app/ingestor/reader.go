package ingestor

import (
	"io"
	"log"
	"sort"
	"sync"
	"sync/atomic"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor/models"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

var geoNamespaceMap = map[string]namespaces.Namespace{
	"US_STATES":        namespaces.US_STATE,
	"US_COUNTIES":      namespaces.US_COUNTY,
	"US_TRIBAL_TRACTS": namespaces.US_TTRACT,
	"US_AIANNH":        namespaces.US_TTRACT,
}

// geospace is a geospace of the database the files refer to.
type geospace struct {
	ns namespaces.Namespace
	id string
}

type geoKey struct {
	ns    namespaces.Namespace
	geoId string
}

// cache maps what the files name (namespace + geo id, ASN org name) to database ids. It
// is filled from the database before an ingest; geospaces missing from the database are
// remembered as missing (-1), ASN orgs missing are created on first sight.
type cache struct {
	geospaceStorage storages.GeospaceStorage
	asnOrgStorage   storages.ASNOrgStorage

	mu        sync.RWMutex
	geoKeys   map[geoKey]int32 // -> index in geospaces, or -1
	geospaces []geospace
	asnOrgs   map[string]string // org name -> id
}

// Caches geospaces and ASNs to avoid repeated queries. Cached values point to their DB ID
// Geospaces are cached by namespace + geoID
// ASNs are cached by organization name
func loadCache(geoStorage storages.GeospaceStorage, asnStorage storages.ASNOrgStorage) (*cache, error) {
	c := &cache{
		geospaceStorage: geoStorage,
		asnOrgStorage:   asnStorage,
		geoKeys:         map[geoKey]int32{},
		asnOrgs:         map[string]string{},
	}
	geoIterator, err := geoStorage.All(nil, nil)
	if err != nil {
		return nil, errors.Wrap(err, "ingestor.loadCache All")
	}
	for geoIterator.HasNext() {
		dg, err := geoIterator.GetRow()
		if err != nil {
			return nil, errors.Wrap(err, "ingestor.loadCache GetRow")
		}
		c.addGeospace(dg.Namespace, dg.GeoId, dg.Id)
	}
	asnIterator, err := asnStorage.All(nil, nil)
	if err != nil {
		return nil, errors.Wrap(err, "ingestor.loadCache All")
	}
	for asnIterator.HasNext() {
		a, err := asnIterator.GetRow()
		if err != nil {
			return nil, errors.Wrap(err, "ingestor.loadCache GetRow")
		}
		c.asnOrgs[a.Organization] = a.Id
	}
	return c, nil
}

func (c *cache) addGeospace(ns namespaces.Namespace, geoId, id string) int32 {
	i := int32(len(c.geospaces))
	c.geospaces = append(c.geospaces, geospace{ns, id})
	c.geoKeys[geoKey{ns, geoId}] = i
	return i
}

// geospace returns the index of the geospace (ns, geoId), or -1 when the database has
// none (call setup_shapes if this ns + geoId set is supposed to be in the DB).
func (c *cache) geospace(ns namespaces.Namespace, geoId string) (int32, error) {
	c.mu.RLock()
	i, ok := c.geoKeys[geoKey{ns, geoId}]
	c.mu.RUnlock()
	if ok {
		return i, nil
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if i, ok := c.geoKeys[geoKey{ns, geoId}]; ok {
		return i, nil
	}
	dg, err := c.geospaceStorage.GetByGeoId(ns, geoId)
	if err == storages.ErrGeospaceNotFound {
		c.geoKeys[geoKey{ns, geoId}] = -1
		return -1, nil
	} else if err != nil {
		return -1, errors.Wrap(err, "cache#geospace GetByGeoId")
	}
	return c.addGeospace(ns, geoId, dg.Id), nil
}

// asnOrg returns the id of the ASN org named orgName, creating it when new.
func (c *cache) asnOrg(orgName string) (string, error) {
	c.mu.RLock()
	id, ok := c.asnOrgs[orgName]
	c.mu.RUnlock()
	if ok {
		return id, nil
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if id, ok := c.asnOrgs[orgName]; ok {
		return id, nil
	}
	aOrg, err := c.asnOrgStorage.GetByOrgName(orgName)
	if err == storages.ErrASNOrgNotFound {
		// Create
		aOrg = &storages.ASNOrg{
			Organization: orgName,
		}
		if err := c.asnOrgStorage.Create(aOrg); err != nil {
			return "", errors.Wrap(err, "cache#asnOrg Create")
		}
	} else if err != nil {
		return "", errors.Wrap(err, "cache#asnOrg GetByOrgName")
	}
	c.asnOrgs[orgName] = aOrg.Id
	return aOrg.Id, nil
}

// geoIndex holds, per test id, the geospaces its reverse geocoding found: a map from the
// id to a chain of entries in a flat slice, so the GC has one pointer per test to trace
// instead of one per string of every row.
type geoIndex struct {
	heads   map[string]int32
	entries []geoEntry
}

type geoEntry struct {
	gs   int32 // index in cache.geospaces
	next int32 // previous entry of the same test, -1 at the end
}

func newGeoIndex() *geoIndex {
	return &geoIndex{heads: map[string]int32{}}
}

func (g *geoIndex) add(id string, gs int32) {
	prev, ok := g.heads[id]
	if !ok {
		prev = -1
	}
	g.entries = append(g.entries, geoEntry{gs: gs, next: prev})
	g.heads[id] = int32(len(g.entries) - 1)
}

// indexGeospaces reads a reversegeocode file: tests of the kept namespaces (see
// geoNamespaceMap) whose geospace is in the database get an entry, so that a test with
// an entry has at least one geospace and a test without is dropped.
func indexGeospaces(r io.Reader, c *cache) (*geoIndex, error) {
	index := newGeoIndex()
	var mu sync.Mutex
	err := decodeBlocks(r, func(rows []models.RevGeoResult) error {
		type resolved struct {
			id string
			gs int32
		}
		batch := make([]resolved, 0, len(rows))
		for i := range rows {
			m := &rows[i]
			ns, exists := geoNamespaceMap[m.GeoNamespace]
			if !exists {
				continue
			}
			gs, err := c.geospace(ns, m.GeoId)
			if err != nil {
				return err
			}
			if gs < 0 {
				continue
			}
			batch = append(batch, resolved{m.Id, gs})
		}
		mu.Lock()
		defer mu.Unlock()
		for _, r := range batch {
			index.add(r.id, r.gs)
		}
		return nil
	})
	if err != nil {
		return nil, errors.Wrap(err, "ingestor.indexGeospaces")
	}
	return index, nil
}

type decodeResult struct {
	values []*storages.Measurement
	err    error
}

type measurementReader struct {
	cache    *cache
	file     io.ReadCloser
	geoIndex *geoIndex
	ch       chan *decodeResult
	start    sync.Once
	// Tests at or before this time are skipped (nil: none). The hourly ingest passes the newest
	// time already in the database: tests at exactly that second were ingested with it.
	ignoreTimeBefore *time.Time
	// Tests with these ids are skipped (a repair of a day that is partly ingested).
	skipIDs map[string]struct{}
	i       atomic.Int64
	// Tests read from the file, and tests with no US geospace or no ASN org (dropped).
	read, dropped atomic.Int64

	mu      sync.Mutex // Next: the current batch
	current []*storages.Measurement
	done    bool
	err     error
}

func newMeasurementReader(
	file io.ReadCloser,
	geoIndex *geoIndex,
	ignoreTimeBefore *time.Time,
	skipIDs map[string]struct{},
	c *cache,
) *measurementReader {
	return &measurementReader{
		file:             file,
		geoIndex:         geoIndex,
		ignoreTimeBefore: ignoreTimeBefore,
		skipIDs:          skipIDs,
		cache:            c,
	}
}

// geospaces resolves the reverse geocoding results of a test into geospace ids per namespace.
// The smallest id of a namespace is the test's state/county/tribal id, the others are extra
// (a test can be in two counties, or in a tribal tract and an AIANNH area).
func (mr *measurementReader) geospaces(head int32, m *storages.Measurement, seen []int32) []int32 {
	seen = seen[:0]
	for e := head; e >= 0; e = mr.geoIndex.entries[e].next {
		gs := mr.geoIndex.entries[e].gs
		dup := false
		for _, s := range seen {
			if s == gs {
				dup = true
				break
			}
		}
		if !dup {
			seen = append(seen, gs)
		}
	}
	geospaces := mr.cache.geospaces
	for _, gs := range seen {
		g := &geospaces[gs]
		var primary *string
		switch g.ns {
		case namespaces.US_STATE:
			primary = &m.StateId
		case namespaces.US_COUNTY:
			primary = &m.CountyId
		case namespaces.US_TTRACT:
			primary = &m.TribalId
		}
		switch {
		case *primary == "":
			*primary = g.id
		case g.id < *primary:
			m.ExtraGeospaceIds = append(m.ExtraGeospaceIds, *primary)
			*primary = g.id
		default:
			m.ExtraGeospaceIds = append(m.ExtraGeospaceIds, g.id)
		}
	}
	if len(m.ExtraGeospaceIds) > 1 {
		sort.Strings(m.ExtraGeospaceIds)
	}
	return seen
}

// convert turns the rows of one block into the tests to insert, or drops them.
func (mr *measurementReader) convert(rows []models.IPGeocodeResult, seen []int32) ([]*storages.Measurement, []int32, error) {
	out := make([]*storages.Measurement, 0, len(rows))
	var read, dropped int64
	for i := range rows {
		m := &rows[i]
		read++
		if mr.ignoreTimeBefore != nil && m.StartedAt <= mr.ignoreTimeBefore.Unix() {
			continue
		}
		if _, skip := mr.skipIDs[m.Id]; skip {
			continue
		}
		head, ok := mr.geoIndex.heads[m.Id]
		if !ok {
			// US only: tests without a state, county or tribal area are dropped.
			dropped++
			continue
		}
		aId, err := mr.cache.asnOrg(m.ASNOrg)
		if err != nil {
			return nil, seen, errors.Wrap(err, "measurementReader#convert asnOrg")
		}
		if aId == "" {
			dropped++
			continue
		}
		value := &storages.Measurement{
			Id:                 m.Id,
			TestStyle:          m.TestStyle,
			IP:                 m.IP,
			StartedAt:          m.StartedAt,
			Upload:             m.Upload,
			MBPS:               m.MBPS,
			LossRate:           m.LossRate,
			MinRTT:             m.MinRTT,
			Latitude:           m.Latitude,
			Longitude:          m.Longitude,
			LocationAccuracyKM: m.LocationAccuracyKM,
			HasAccessToken:     m.HasAccessToken,
			AccessTokenSig:     m.AccessTokenSig,
			ASNId:              aId,
		}
		seen = mr.geospaces(head, value, seen)
		out = append(out, value)
	}
	mr.read.Add(read)
	mr.dropped.Add(dropped)
	return out, seen, nil
}

func (mr *measurementReader) startDecodeWorker() {
	mr.ch = make(chan *decodeResult, 8)
	go func() {
		defer close(mr.ch)
		defer mr.file.Close()
		var pool sync.Pool // []int32 scratch per goroutine
		err := decodeBlocks(mr.file, func(rows []models.IPGeocodeResult) error {
			seen, _ := pool.Get().([]int32)
			values, seen, err := mr.convert(rows, seen)
			pool.Put(seen[:0])
			if err != nil {
				return err
			}
			if len(values) > 0 {
				mr.ch <- &decodeResult{values: values}
			}
			return nil
		})
		if err != nil {
			mr.ch <- &decodeResult{err: errors.Wrap(err, "measurementReader#startDecodeWorker")}
		}
	}()
}

// NextBatch returns the next decoded tests, or nil at the end. It is safe to call from
// several goroutines (the inserters share one reader).
func (mr *measurementReader) NextBatch() ([]*storages.Measurement, error) {
	mr.start.Do(mr.startDecodeWorker)
	res, ok := <-mr.ch
	if !ok {
		return nil, nil
	}
	if res.err != nil {
		return nil, res.err
	}
	if n := mr.i.Add(int64(len(res.values))); n/100000 != (n-int64(len(res.values)))/100000 {
		log.Println("Tests:", n)
	}
	return res.values, nil
}

// Next implements storages.MeasurementIterator one test at a time.
func (mr *measurementReader) Next() (*storages.Measurement, error) {
	mr.mu.Lock()
	defer mr.mu.Unlock()
	for len(mr.current) == 0 {
		if mr.done {
			return nil, mr.err
		}
		batch, err := mr.NextBatch()
		if err != nil || batch == nil {
			mr.done, mr.err = true, err
			return nil, err
		}
		mr.current = batch
	}
	m := mr.current[0]
	mr.current = mr.current[1:]
	return m, nil
}
