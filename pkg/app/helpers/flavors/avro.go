package flavors

import (
	"fmt"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/ipgeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/app/measurementlinker"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
	"github.com/exactlylabs/mlab-processor/pkg/app/reversegeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/localdatastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/storagedatastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders/avro"
)

func getAvroStoreSchema(store string) string {
	switch store {
	case fetcher.StepName:
		return models.FetchedResultSchema
	case ipgeocoder.StepName:
		return models.GeocodedResultSchema
	case reversegeocoder.StepName:
		return models.RevGeoResultSchema
	case measurementlinker.StepName:
		return models.MeasLinkResultSchema
	default:
		panic(fmt.Errorf("storage.getStoreSchema err: Avro schema not found for %v", store))
	}
}

// AvroLocalDataStoreFactory returns a Local DataStore provider, that stores data in Avro format
func AvroLocalDataStoreFactory(store string, date time.Time, obj any) (datastore.DataStore, error) {
	filePath := fmt.Sprintf("output/%v/%v.avro", store, date.Format("2006-01-02"))
	schema := getAvroStoreSchema(store)
	encoderProvider := avro.NewAvroEncoderFactory(schema)
	ds, err := localdatastore.New(filePath, encoderProvider, avro.NewAvroDecoder, obj)
	if err != nil {
		return nil, err
	}
	return ds, nil
}

// NewAvroStorageDataStoreFactory builds a new DataStoreProvider for a given uploader
func NewAvroStorageDataStoreFactory(uploader *storagedatastore.Uploader) pipeline.DataStoreProvider {
	return func(store string, date time.Time, obj any) (datastore.DataStore, error) {
		filePath := fmt.Sprintf("%v/%v.avro", store, date.Format("2006-01-02"))
		schema := getAvroStoreSchema(store)
		encoderProvider := avro.NewAvroEncoderFactory(schema)
		ds, err := storagedatastore.New(uploader, filePath, encoderProvider, avro.NewAvroDecoder, obj)
		if err != nil {
			return nil, err
		}
		return ds, nil
	}
}
