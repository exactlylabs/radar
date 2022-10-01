package reversegeocoder

import (
	"fmt"
	"log"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/app/writer"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/geo"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
	shp "github.com/jonas-p/go-shp"
)

const StepName string = "reversegeocode"

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

func geocodingWorker(wg *sync.WaitGroup, writer *writer.DataStoreWriter, ch chan *geocodeWorkItem) {
	defer wg.Done()

	for toProcess := range ch {
		// Save
		results := index.ContainingShapeID(&geo.Point{
			Lat: toProcess.geocodedResult.Latitude,
			Lng: toProcess.geocodedResult.Longitude,
		})

		for _, result := range results {
			writer.WriteItem(&models.RevGeoResult{
				GeoNamespace: result.Namespace,
				Id:           toProcess.geocodedResult.Id,
				GeoId:        result.ExternalId,
				StartedAt:    toProcess.geocodedResult.StartedAt,
			})
		}
	}
}

func newGeocodingPool(writer *writer.DataStoreWriter) *geocodingPool {
	ch := make(chan *geocodeWorkItem)
	wg := &sync.WaitGroup{}

	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go geocodingWorker(wg, writer, ch)
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

func addShapeToIndex(index *geo.Index, namespace, shpPath string) error {
	dotPaths := strings.Split(shpPath, ".")
	if len(dotPaths) == 0 || (dotPaths[len(dotPaths)-1] != "zip" && dotPaths[len(dotPaths)-1] != "shp") {
		return fmt.Errorf("%s must have a .shp or .zip extension", shpPath)
	}
	// open a shapefile for reading
	var shape shp.SequentialReader
	var err error
	if dotPaths[len(dotPaths)-1] == "shp" {
		shape, err = shp.Open(shpPath)
	} else {
		shape, err = shp.OpenZip(shpPath)
	}

	if err != nil {
		return fmt.Errorf("reversegeocoder.initIndex err: %w", err)
	}
	defer shape.Close()

	// fields from the attribute table (DBF)
	fields := shape.Fields()

	// loop through all features in the shapefile
	for shape.Next() {
		_, p := shape.Shape()

		poly := p.(*shp.Polygon)

		var geoid string
		for k, f := range fields {
			if f.String() == "GEOID" || f.String() == "GEOID20" {
				geoid = shape.Attribute(k)
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

			geoPoly := geo.NewPolygon(loopPoints)

			index.Add(namespace, geoid, geoPoly)
		}
	}
	return nil
}

func initIndex() {
	if !indexInitialized {
		log.Println("ReverseGeocoder - Loading Index")
		index = geo.NewIndex()

		files := config.GetConfig().ShapePathEntries()
		for namespace, path := range files {
			err := addShapeToIndex(index, namespace, path)
			if err != nil {
				panic(err)
			}
		}

		for _, path := range config.GetConfig().TractShapesByStateId() {
			err := addShapeToIndex(index, "CENSUS_TRACTS", path)
			if err != nil {
				panic(err)
			}
		}

		indexInitialized = true
		log.Println("ReverseGeocoder - Index Initialized")
	}
}

func processDate(ds datastore.DataStore, geocodeDS datastore.DataStore, date time.Time) error {
	writer := writer.NewWriter(ds)
	defer writer.Close()
	pool := newGeocodingPool(writer)

	iter, err := geocodeDS.ItemsReader()
	if err != nil {
		return fmt.Errorf("reversegeocoder.processDate dsProvider.Read error: %w", err)
	}
	log.Printf("ReverseGeocoder - Getting Rows for %v\n", date)
	for iter.Next() {
		next, err := iter.GetRow()
		if err != nil {
			return fmt.Errorf("reversegeocoder.processDate Next error: %w", err)
		}
		pool.Queue(date, next.(*models.GeocodedResult))
	}

	pool.Close() // Wait until all jobs are done
	log.Printf("ReverseGeocoder - Finished processing for %v\n", date)
	return nil
}

func ReverseGeocode(ds datastore.DataStore, geocodeDS datastore.DataStore, date time.Time) {
	defer timer.TimeIt(time.Now(), "ReverseGeocode")
	initIndex()

	if err := processDate(ds, geocodeDS, date); err != nil {
		panic(err)
	}
}
