package geocoder

import (
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/geo"
	"github.com/exactlylabs/mlab-processor/pkg/services/storage"
	shp "github.com/jonas-p/go-shp"
)

var index *geo.Index
var indexInitialized bool

type geocodeWorkItem struct {
	geocodedResult *models.GeocodedResult
	date           time.Time
}

type geocodingPool struct {
	wg *sync.WaitGroup
	ch chan *geocodeWorkItem
}

func geocodingWorker(wg *sync.WaitGroup, ch chan *geocodeWorkItem) {
	defer wg.Done()

	for toProcess := range ch {
		// Save
		results := index.ContainingShapeID(&geo.Point{
			Lat: toProcess.geocodedResult.Latitude,
			Lng: toProcess.geocodedResult.Longitude,
		})

		for _, result := range results {
			storage.PushDatedRow("reverse", toProcess.date, &models.RevGeoResult{
				GeoNamespace: result.Namespace,
				Id:           toProcess.geocodedResult.Id,
				GeoId:        result.ExternalId,
			})
		}
	}
}

func newGeocodingPool() *geocodingPool {
	ch := make(chan *geocodeWorkItem)
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

func (p *geocodingPool) Queue(date time.Time, toProcess *models.GeocodedResult) {
	p.ch <- &geocodeWorkItem{
		geocodedResult: toProcess,
		date:           date,
	}
}

func (p *geocodingPool) Close() {
	close(p.ch)
	p.wg.Wait()
}

func initIndex() {
	if !indexInitialized {
		index = geo.NewIndex()

		files := config.GetConfig().ShapePathEntries()
		for namespace, path := range files {
			// open a shapefile for reading
			shape, err := shp.Open(path)
			if err != nil {
				panic(fmt.Errorf("geocoder.initIndex err: %w", err))
			}
			defer shape.Close()

			// fields from the attribute table (DBF)
			fields := shape.Fields()

			// loop through all features in the shapefile
			for shape.Next() {
				n, p := shape.Shape()

				poly := p.(*shp.Polygon)

				var geoid string
				for k, f := range fields {
					if f.String() == "GEOID" {
						geoid = shape.ReadAttribute(n, k)
						break
					}
				}

				for i := int32(0); i < poly.NumParts; i++ {
					var startIndex, endIndex int32

					if i == 0 {
						startIndex = 0
					} else {
						startIndex = poly.Parts[i]
					}

					if i == poly.NumParts {
						endIndex = poly.Parts[i+1]
					} else {
						endIndex = int32(len(poly.Points))
					}

					loopPoints := make([]*geo.Point, endIndex-startIndex)
					for li := startIndex; li < endIndex; li++ {
						loopPoints[li-startIndex] = &geo.Point{
							Lat: poly.Points[li].Y,
							Lng: poly.Points[li].X,
						}
					}

					/*if geoid == "06075" {
						for x := 0; x < len(loopPoints); x++ {
							fmt.Printf("[%f, %f],\n", loopPoints[x].Lat, loopPoints[x].Lng)
						}
					}*/

					geoPoly := geo.NewPolygon(loopPoints)

					index.Add(namespace, geoid, geoPoly)
				}
			}
		}

		indexInitialized = true
	}
}

func ReverseGeocode(startDate, endDate time.Time, rerun bool) {
	initIndex()

	var dateRange []time.Time
	if rerun {
		dateRange = helpers.DateRange(startDate, endDate)
	} else {
		dateRange = storage.Incomplete("revgeocode", startDate, endDate)
	}

	for _, date := range dateRange {
		pool := newGeocodingPool()

		iter := storage.DatedRows("geocode", &models.GeocodedResult{}, date)
		next := iter.Next()
		for next != nil {
			pool.Queue(date, next.(*models.GeocodedResult))
			next = iter.Next()
		}

		pool.Close()

		storage.MarkCompleted("revgeocode", date)
	}

	storage.Close()
}
