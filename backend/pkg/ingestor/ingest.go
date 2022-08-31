package ingestor

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/models"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/hamba/avro/ocf"
)

type geodata struct {
	namespace string
	geoId     string
}

func Ingest(s ports.MeasurementsStorage, bucketName string, start, end time.Time) error {
	it, err := Fetch(bucketName, []string{"ipgeocode", "reversegeocode"}, start, end)
	if err != nil {
		return err
	}
	for readers, err := it.Next(); readers != nil; readers, err = it.Next() {
		if err != nil {
			return err
		}

		measReader, revReader := readers[0], readers[1]
		data, err := ioutil.ReadAll(measReader)
		if err != nil {
			return err
		}
		log.Println("Downloaded reader")
		measDecoder, err := ocf.NewDecoder(bytes.NewBuffer(data))
		if err != nil {
			return err
		}
		// Load the whole file
		revDecoder, err := ocf.NewDecoder(revReader)
		if err != nil {
			return err
		}
		index, err := indexGeospaces(revDecoder)
		if err != nil {
			return err
		}
		revReader.Close()

		if err := s.InsertMeasurements(
			&measurementIterator{decoder: measDecoder, geoIndex: index},
		); err != nil {
			return err
		}
	}
	return nil
}

func indexGeospaces(dec *ocf.Decoder) (map[string][]geodata, error) {
	index := make(map[string][]geodata)
	for dec.HasNext() {
		m := &models.RevGeoResult{}
		if err := dec.Decode(m); err != nil {
			return nil, fmt.Errorf("ingestor.indexGeospaces HasNext: %w", err)
		}
		if _, exists := index[m.Id]; !exists {
			index[m.Id] = make([]geodata, 0)
		}
		index[m.Id] = append(index[m.Id], geodata{m.GeoNamespace, m.GeoId})
	}
	return index, nil
}
