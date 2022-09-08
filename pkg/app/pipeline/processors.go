package pipeline

import (
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/ipgeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/app/measurementlinker"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/app/reversegeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
)

type DataStoreProvider func(string, time.Time, interface{}) (datastore.DataStore, error)
type ProcessorRunner func(ctx *PipelineContext, dsProvider DataStoreProvider, date time.Time) datastore.DataStore

var availableProcessors = map[string]ProcessorRunner{
	fetcher.StepName:           runFetch,
	ipgeocoder.StepName:        runIPGeocoder,
	reversegeocoder.StepName:   runRevGeocoder,
	measurementlinker.StepName: runMeasurementsLinker,
}

func runFetch(ctx *PipelineContext, dsProvider DataStoreProvider, date time.Time) datastore.DataStore {
	ds, err := dsProvider(fetcher.StepName, date, models.FetchedResult{})
	if err != nil {
		panic(err)
	}
	fetcher.Fetch(ds, date)
	return ds
}

func runIPGeocoder(ctx *PipelineContext, dsProvider DataStoreProvider, date time.Time) datastore.DataStore {
	fetchDS, err := dsProvider(fetcher.StepName, date, models.FetchedResult{})
	if err != nil {
		panic(err)
	}
	if !fetchDS.Exists() {
		return nil
	}
	ds, err := dsProvider(ipgeocoder.StepName, date, models.GeocodedResult{})
	if err != nil {
		panic(err)
	}

	ipgeocoder.Geocode(ds, fetchDS, date)
	return ds
}

func runRevGeocoder(ctx *PipelineContext, dsProvider DataStoreProvider, date time.Time) datastore.DataStore {
	ipGeoDS, err := dsProvider(ipgeocoder.StepName, date, models.GeocodedResult{})
	if err != nil {
		panic(err)
	}
	if !ipGeoDS.Exists() {
		return nil
	}

	ds, err := dsProvider(reversegeocoder.StepName, date, models.RevGeoResult{})
	if err != nil {
		panic(err)
	}
	reversegeocoder.ReverseGeocode(ds, ipGeoDS, date)

	return ds
}

func runMeasurementsLinker(ctx *PipelineContext, dsProvider DataStoreProvider, date time.Time) datastore.DataStore {
	if ctx.GetValue("ipMap") == nil {
		ctx.SetValue("ipMap", &sync.Map{})
	}
	ipMap := ctx.GetValue("ipMap").(*sync.Map)
	ipGeoDS, err := dsProvider(ipgeocoder.StepName, date, models.GeocodedResult{})
	if err != nil {
		panic(err)
	}
	if !ipGeoDS.Exists() {
		return nil
	}
	ds, err := dsProvider(measurementlinker.StepName, date, models.MeasLinkResult{})
	if err != nil {
		panic(err)
	}

	measurementlinker.LinkMeasurements(ds, ipGeoDS, date, ipMap)
	return ds
}
