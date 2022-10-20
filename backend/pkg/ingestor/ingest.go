package ingestor

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/models"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/hamba/avro/ocf"
)

type geodata struct {
	namespace string
	geoId     string
}

func processDate(readers []io.ReadCloser, s ports.MeasurementsStorage) error {
	measReader, revReader := readers[0], readers[1]
	measDecoder, err := ocf.NewDecoder(measReader)
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
	return nil
}

func Ingest(ctx context.Context, s ports.MeasurementsStorage, bucketName string, start, end time.Time) error {
	if err := s.Open(); err != nil {
		panic(err)
	}
	defer s.Close()
	it, err := Fetch(bucketName, []string{"ipgeocode", "reversegeocode"}, start, end)
	if err != nil {
		return err
	}
	for {
		select {
		case <-ctx.Done():
			return nil
		default:
			readers, err := it.Next()
			if err != nil {
				return errors.Wrap(err, "ingestor.Ingest Next")
			}
			if readers == nil {
				return nil
			}
			if err := processDate(readers, s); err != nil {
				return errors.Wrap(err, "ingestor.Ingest processDate")
			}
		}
	}
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
