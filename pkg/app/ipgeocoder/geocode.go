package ipgeocoder

import (
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/helpers"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/geocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/storage"
)

type geocodingPool struct {
	wg *sync.WaitGroup
	ch chan *models.FetchedResult
}

func geocodingWorker(wg *sync.WaitGroup, ch chan *models.FetchedResult) {
	defer wg.Done()

	for toProcess := range ch {
		// Process
		lat, lng, err := geocoder.Geocode(toProcess.IPAddress)
		if err != nil {
			panic(fmt.Errorf("error geocoding %s: %s", toProcess.IPAddress, err))
		}
		// Save
		storage.PushDatedRow("geocode", toProcess.Date, models.GeocodedResult{
			IPAddress: toProcess.IPAddress,
			Latitude:  lat,
			Longitude: lng,
		})
	}
}

func newGeocodingPool() *geocodingPool {
	ch := make(chan *models.FetchedResult)
	wg := &sync.WaitGroup{}

	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go geocodingWorker(wg, ch)
	}

	return &geocodingPool{
		wg: wg,
		ch: ch,
	}
}

func (p *geocodingPool) Queue(toProcess *models.FetchedResult) {
	p.ch <- toProcess
}

func (p *geocodingPool) Close() {
	p.wg.Wait()
}

func Geocode(startDate, endDate time.Time, rerun bool) {
	var dateRange []time.Time
	if rerun {
		dateRange = helpers.DateRange(startDate, endDate)
	} else {
		dateRange = storage.Incomplete("geocode", startDate, endDate)
	}

	pool := newGeocodingPool()
	defer pool.Close()

	for _, date := range dateRange {
		iter := storage.DatedRows("fetched", date)
		next := iter.Next()
		for next != nil {
			pool.Queue(next.(*models.FetchedResult))
			next = iter.Next()
		}

		storage.MarkCompleted("geocode", date)
	}
}
