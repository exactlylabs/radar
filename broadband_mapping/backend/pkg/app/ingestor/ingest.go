package ingestor

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor/models"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/hamba/avro/ocf"
)

type geodata struct {
	namespace string
	geoId     string
}

func processDate(readers []io.ReadCloser, startTime time.Time, s storages.IngestorAppStorages) error {
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
	if err := s.MeasurementStorage.Insert(
		newMeasurementReader(measDecoder, index, &startTime, s.GeospaceStorage, s.ASNOrgStorage),
	); err != nil {
		return err
	}
	return nil
}

func Ingest(ctx context.Context, s storages.IngestorAppStorages, bucketName string, start, end time.Time, summarize bool) error {
	it, err := Fetch(bucketName, []string{"ipgeocode", "reversegeocode"}, start, end)
	if err != nil {
		return err
	}
	if it == nil {
		return nil
	}
	if err := s.OpenAll(); err != nil {
		panic(err)
	}
	defer s.CloseAll()
	defer clearCache()
	if err := loadCache(s.GeospaceStorage, s.ASNOrgStorage); err != nil {
		return errors.Wrap(err, "ingestor.Ingest loadCache")
	}

	if err := ingestFetchedData(ctx, start, s, it); err != nil {
		return err
	}
	// Ensure that any outstanding insertion is finished before summarizing
	if summarize {
		s.Summarize(0)
	}
	return nil
}

func ingestFetchedData(ctx context.Context, startTime time.Time, s storages.IngestorAppStorages, it *ItemIterator) error {
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
			if err := processDate(readers, startTime, s); err != nil {
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
