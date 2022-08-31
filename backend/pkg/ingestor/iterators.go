package ingestor

import (
	"fmt"
	"log"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/models"
	"github.com/hamba/avro/ocf"
)

type decodeResult struct {
	value *models.Measurements
	err   error
}

type measurementIterator struct {
	decoder  *ocf.Decoder
	geoIndex map[string][]geodata
	ch       chan *decodeResult
	started  bool
	i        int
}

func (mi *measurementIterator) startDecodeWorker() {
	mi.ch = make(chan *decodeResult)
	go func() {
		for mi.decoder.HasNext() {
			m := &models.IPGeocodeResult{}
			if err := mi.decoder.Decode(m); err != nil {
				mi.ch <- &decodeResult{err: nil}
			}
			if geospaces, ok := mi.geoIndex[m.Id]; ok {
				for _, geospace := range geospaces {
					value := &models.Measurements{
						IPGeocodeResult: *m,
						GeoNamespace:    geospace.namespace,
						GeoId:           geospace.geoId,
					}
					mi.ch <- &decodeResult{value: value}
				}
			}
		}
		mi.ch <- &decodeResult{}
	}()
	mi.started = true
}

func (mi *measurementIterator) Next() (*models.Measurements, error) {
	if !mi.started {
		mi.startDecodeWorker()
	}
	res := <-mi.ch
	mi.i++
	if mi.i%10000 == 0 {
		log.Println("Rows:", mi.i)
	}
	return res.value, res.err
}

type revGeoResultIterator struct {
	decoder *ocf.Decoder
}

func (mi *revGeoResultIterator) Next() (*models.RevGeoResult, error) {
	if mi.decoder.HasNext() {
		obj := &models.RevGeoResult{}
		if err := mi.decoder.Decode(obj); err != nil {
			return nil, fmt.Errorf("revGeoResultIterator Decode: %w", err)
		}
		return obj, nil
	}
	return nil, nil
}
