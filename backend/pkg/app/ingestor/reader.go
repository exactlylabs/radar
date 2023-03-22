package ingestor

import (
	"log"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor/models"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/hamba/avro/ocf"
)

var geoNamespaceMap = map[string]namespaces.Namespace{
	"US_STATES":        namespaces.US_STATE,
	"US_COUNTIES":      namespaces.US_COUNTY,
	"US_TRIBAL_TRACTS": namespaces.US_TTRACT,
}

// Cache some variables that are going to be called a lot by the iterator but will never change during the ingestion
var geospaceCache = &sync.Map{}
var asnOrgCache = &sync.Map{}

type decodeResult struct {
	value *storages.Measurement
	err   error
}

type measurementReader struct {
	geospaceStorage  storages.GeospaceStorage
	asnOrgStorage    storages.ASNOrgStorage
	decoder          *ocf.Decoder
	geoIndex         map[string][]geodata
	ch               chan *decodeResult
	started          bool
	ignoreTimeBefore *time.Time
	i                int
}

func newMeasurementReader(
	decoder *ocf.Decoder,
	geoIndex map[string][]geodata,
	ignoreTimeBefore *time.Time,
	geospaceStorage storages.GeospaceStorage,
	asnOrgStorage storages.ASNOrgStorage,
) *measurementReader {
	return &measurementReader{
		decoder:          decoder,
		geoIndex:         geoIndex,
		ignoreTimeBefore: ignoreTimeBefore,
		geospaceStorage:  geospaceStorage,
		asnOrgStorage:    asnOrgStorage,
	}
}

func (mr *measurementReader) startDecodeWorker() {
	mr.ch = make(chan *decodeResult)
	go func() {
		for mr.decoder.HasNext() {
			m := &models.IPGeocodeResult{}
			if err := mr.decoder.Decode(m); err != nil {
				mr.ch <- &decodeResult{err: nil}
				continue
			}
			if mr.ignoreTimeBefore != nil && m.StartedAt < mr.ignoreTimeBefore.Unix() {
				continue
			}
			if geospaces, ok := mr.geoIndex[m.Id]; ok {
				for _, geospace := range geospaces {
					ns, exists := geoNamespaceMap[geospace.namespace]
					if !exists {
						continue
					}
					gId, err := mr.getGeospace(ns, geospace.geoId)
					if err != nil {
						mr.ch <- &decodeResult{err: errors.Wrap(err, "measurementIterator#startDecodeWorker getOrCreateGeospace")}
						continue
					}
					if gId == "" {
						continue
					}
					aId, err := mr.getOrCreateASNOrg(m.ASNOrg)
					if err != nil {
						mr.ch <- &decodeResult{err: errors.Wrap(err, "measurementIterator#startDecodeWorker getOrCreateASNOrg")}
						continue
					}
					if aId == "" {
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
						GeospaceId:         gId,
						ASNId:              aId,
						HasAccessToken:     m.HasAccessToken,
						AccessTokenSig:     m.AccessTokenSig,
					}
					mr.ch <- &decodeResult{value: value}
				}
			}
		}
		mr.ch <- &decodeResult{}
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
	res := <-mr.ch
	mr.i++
	if mr.i%10000 == 0 {
		log.Println("Rows:", mr.i)
	}
	return res.value, res.err
}

func clearCache() {
	geospaceCache = &sync.Map{}
	asnOrgCache = &sync.Map{}
}

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
