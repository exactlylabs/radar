package ingestor

import (
	"log"
	"sort"
	"sync"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor/models"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/hamba/avro/ocf"
)

var geoNamespaceMap = map[string]namespaces.Namespace{
	"US_STATES":        namespaces.US_STATE,
	"US_COUNTIES":      namespaces.US_COUNTY,
	"US_TRIBAL_TRACTS": namespaces.US_TTRACT,
	"US_AIANNH":        namespaces.US_TTRACT,
}

// Cache some variables that are going to be called a lot by the iterator but will never change during the ingestion
var geospaceCache = &sync.Map{}
var asnOrgCache = &sync.Map{}

type decodeResult struct {
	value *storages.Measurement
	err   error
}

type measurementReader struct {
	geospaceStorage storages.GeospaceStorage
	asnOrgStorage   storages.ASNOrgStorage
	decoder         *ocf.Decoder
	geoIndex        map[string][]geodata
	ch              chan *decodeResult
	started         bool
	// Tests at or before this time are skipped (nil: none). The hourly ingest passes the newest
	// time already in the database: tests at exactly that second were ingested with it.
	ignoreTimeBefore *time.Time
	// Tests with these ids are skipped (a repair of a day that is partly ingested).
	skipIDs map[string]struct{}
	i       int
	// Tests read from the file, and tests with no US geospace or no ASN org (dropped).
	read, dropped int
}

func newMeasurementReader(
	decoder *ocf.Decoder,
	geoIndex map[string][]geodata,
	ignoreTimeBefore *time.Time,
	skipIDs map[string]struct{},
	geospaceStorage storages.GeospaceStorage,
	asnOrgStorage storages.ASNOrgStorage,
) *measurementReader {
	return &measurementReader{
		decoder:          decoder,
		geoIndex:         geoIndex,
		ignoreTimeBefore: ignoreTimeBefore,
		skipIDs:          skipIDs,
		geospaceStorage:  geospaceStorage,
		asnOrgStorage:    asnOrgStorage,
	}
}

// geospaces resolves the reverse geocoding results of a test into geospace ids per namespace.
// The smallest id of a namespace is the test's state/county/tribal id, the others are extra
// (a test can be in two counties, or in a tribal tract and an AIANNH area).
func (mr *measurementReader) geospaces(geos []geodata, m *storages.Measurement) error {
	byNS := map[namespaces.Namespace][]string{}
	seen := map[string]bool{}
	for _, geospace := range geos {
		ns, exists := geoNamespaceMap[geospace.namespace]
		if !exists {
			continue
		}
		gId, err := mr.getGeospace(ns, geospace.geoId)
		if err != nil {
			return errors.Wrap(err, "measurementReader#geospaces getGeospace")
		}
		if gId == "" || seen[gId] {
			continue
		}
		seen[gId] = true
		byNS[ns] = append(byNS[ns], gId)
	}
	for ns, ids := range byNS {
		sort.Strings(ids)
		switch ns {
		case namespaces.US_STATE:
			m.StateId = ids[0]
		case namespaces.US_COUNTY:
			m.CountyId = ids[0]
		case namespaces.US_TTRACT:
			m.TribalId = ids[0]
		}
		m.ExtraGeospaceIds = append(m.ExtraGeospaceIds, ids[1:]...)
	}
	sort.Strings(m.ExtraGeospaceIds)
	return nil
}

func (mr *measurementReader) startDecodeWorker() {
	mr.ch = make(chan *decodeResult, 10)
	go func() {
		defer close(mr.ch)
		for mr.decoder.HasNext() {
			m := &models.IPGeocodeResult{}
			if err := mr.decoder.Decode(m); err != nil {
				mr.ch <- &decodeResult{err: errors.Wrap(err, "measurementReader#startDecodeWorker Decode")}
				return
			}
			mr.read++
			if mr.ignoreTimeBefore != nil && m.StartedAt <= mr.ignoreTimeBefore.Unix() {
				continue
			}
			if _, skip := mr.skipIDs[m.Id]; skip {
				continue
			}
			geos, ok := mr.geoIndex[m.Id]
			if !ok {
				mr.dropped++
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
			}
			if err := mr.geospaces(geos, value); err != nil {
				mr.ch <- &decodeResult{err: err}
				return
			}
			// US only: tests without a state, county or tribal area are dropped.
			if value.StateId == "" && value.CountyId == "" && value.TribalId == "" && len(value.ExtraGeospaceIds) == 0 {
				mr.dropped++
				continue
			}
			aId, err := mr.getOrCreateASNOrg(m.ASNOrg)
			if err != nil {
				mr.ch <- &decodeResult{err: errors.Wrap(err, "measurementReader#startDecodeWorker getOrCreateASNOrg")}
				return
			}
			if aId == "" {
				mr.dropped++
				continue
			}
			value.ASNId = aId
			mr.ch <- &decodeResult{value: value}
		}
	}()
	mr.started = true
}

func (mr *measurementReader) getGeospace(ns namespaces.Namespace, geoId string) (g string, err error) {
	if g, exists := geospaceCache.Load(geospaceCacheKey(ns, geoId)); exists {
		return g.(string), nil
	}
	dg, err := mr.geospaceStorage.GetByGeoId(ns, geoId)
	if err == storages.ErrGeospaceNotFound {
		// Call setup_shapes if this ns + geoId set is supposed to be in the DB
		return "", nil
	} else if err != nil {
		return "", errors.Wrap(err, "measurementIterator#getGeospace GetByGeoId")
	} else {
		g = dg.Id
	}
	geospaceCache.Store(geospaceCacheKey(ns, geoId), g)
	return g, nil
}

func (mr *measurementReader) getOrCreateASNOrg(orgName string) (a string, err error) {
	if a, exists := asnOrgCache.Load(orgName); exists {
		return a.(string), nil
	}
	aOrg, err := mr.asnOrgStorage.GetByOrgName(orgName)
	if err == storages.ErrASNOrgNotFound {
		// Create
		aOrg = &storages.ASNOrg{
			Organization: orgName,
		}
		if err := mr.asnOrgStorage.Create(aOrg); err != nil {
			return "", errors.Wrap(err, "measurementIterator#getOrCreateASNOrg Create")
		}
	} else if err != nil {
		return "", errors.Wrap(err, "measurementIterator#getOrCreateASNOrg GetByOrgName")
	}
	a = aOrg.Id
	asnOrgCache.Store(orgName, a)
	return a, nil
}

func (mr *measurementReader) Next() (*storages.Measurement, error) {
	if !mr.started {
		mr.startDecodeWorker()
	}
	res, ok := <-mr.ch
	if !ok {
		return nil, nil
	}
	mr.i++
	if mr.i%100000 == 0 {
		log.Println("Tests:", mr.i)
	}
	return res.value, res.err
}

func clearCache() {
	geospaceCache = &sync.Map{}
	asnOrgCache = &sync.Map{}
}

// Caches geospaces and ASNs to avoid repeated queries. Cached values point to their DB ID
// Geospaces are cached by namespace + geoID
// ASNs are cached by organization name
func loadCache(geoStorage storages.GeospaceStorage, asnStorage storages.ASNOrgStorage) error {
	clearCache()
	geoIterator, err := geoStorage.All(nil, nil)
	if err != nil {
		return errors.Wrap(err, "ingestor.loadCache All")
	}
	for geoIterator.HasNext() {
		dg, err := geoIterator.GetRow()
		if err != nil {
			return errors.Wrap(err, "ingestor.loadCache GetRow")
		}
		geospaceCache.Store(geospaceCacheKey(dg.Namespace, dg.GeoId), dg.Id)
	}
	asnIterator, err := asnStorage.All(nil, nil)
	if err != nil {
		return errors.Wrap(err, "ingestor.loadCache All")
	}
	for asnIterator.HasNext() {
		a, err := asnIterator.GetRow()
		if err != nil {
			return errors.Wrap(err, "ingestor.loadCache GetRow")
		}
		asnOrgCache.Store(a.Organization, a.Id)
	}
	return nil
}

func geospaceCacheKey(ns namespaces.Namespace, geoId string) string {
	return string(ns) + geoId
}
