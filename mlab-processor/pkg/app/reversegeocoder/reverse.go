package reversegeocoder

import (
	"fmt"
	"log"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/datastorewriter"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/geo"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
	shp "github.com/jonas-p/go-shp"
)

const StepName string = "reversegeocode"

// ReverseGeocoder holds the shape index.
type ReverseGeocoder struct {
	index *geo.Index
}

// Stats is the per-date accounting of the reversegeocode step.
type Stats struct {
	Read    int64 `json:"read"`
	Matched int64 `json:"matched"` // rows inside at least one shape
	Written int64 `json:"written"` // output rows (one per row and matching shape)
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
		return fmt.Errorf("reversegeocoder.addShapeToIndex %s: %w", shpPath, err)
	}
	defer shape.Close()

	// fields from the attribute table (DBF)
	fields := shape.Fields()

	// loop through all features in the shapefile
	for shape.Next() {
		_, p := shape.Shape()

		poly, ok := p.(*shp.Polygon)
		if !ok {
			return fmt.Errorf("reversegeocoder.addShapeToIndex %s: unexpected shape type %T", shpPath, p)
		}

		var geoid string
		for k, f := range fields {
			if f.String() == "GEOID" || f.String() == "GEOID20" || f.String() == "ORG_CODE" {
				geoid = shape.Attribute(k)
				break
			}
		}

		for i := int32(0); i < poly.NumParts; i++ {
			var startIndex, endIndex int32

			startIndex = poly.Parts[i]

			if i < poly.NumParts-1 {
				endIndex = poly.Parts[i+1]
			} else {
				endIndex = int32(len(poly.Points))
			}
			loopPoints := make([]geo.Point, endIndex-startIndex)
			for li := startIndex; li < endIndex; li++ {
				loopPoints[li-startIndex] = geo.Point{
					Lat: poly.Points[li].Y,
					Lng: poly.Points[li].X,
				}
			}

			index.Add(namespace, geoid, geo.NewPolygon(loopPoints))
		}
	}
	if err := shape.Err(); err != nil {
		return fmt.Errorf("reversegeocoder.addShapeToIndex %s: %w", shpPath, err)
	}
	return nil
}

// Load builds the shape index from SHAPE_PATHS (kept namespaces only).
func Load(conf *config.ProcessorConfig) (*ReverseGeocoder, error) {
	defer timer.TimeIt(time.Now(), "ReverseGeocodeLoad")
	index := geo.NewIndex()
	for _, e := range shapePathEntries(conf) {
		log.Printf("ReverseGeocoder - Loading %s from file %s\n", e.namespace, e.path)
		if err := addShapeToIndex(index, e.namespace, e.path); err != nil {
			return nil, err
		}
	}
	log.Printf("ReverseGeocoder - Index Initialized (%d rings)", index.Len())
	return &ReverseGeocoder{index: index}, nil
}

// ReverseGeocode writes one row per (test, containing shape) of geocodeDS to ds.
func (rg *ReverseGeocoder) ReverseGeocode(ds datastore.DataStore, geocodeDS datastore.DataStore, date time.Time) (*Stats, error) {
	defer timer.TimeIt(time.Now(), "ReverseGeocode")
	stats := &Stats{}

	iter, err := geocodeDS.ItemsReader()
	if err != nil {
		return stats, fmt.Errorf("reversegeocoder: reading ipgeocode output: %w", err)
	}
	defer iter.Close()

	writer := datastorewriter.NewWriter(ds)
	ch := make(chan *models.GeocodedResult, 1024)
	var wg sync.WaitGroup
	var matched int64
	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for r := range ch {
				results := rg.index.ContainingShapeID(&geo.Point{Lat: r.Latitude, Lng: r.Longitude})
				if len(results) > 0 {
					atomic.AddInt64(&matched, 1)
				}
				for _, result := range results {
					writer.WriteItem(&models.RevGeoResult{
						GeoNamespace: result.Namespace,
						Id:           r.Id,
						GeoId:        result.ExternalId,
						StartedAt:    r.StartedAt,
					})
				}
			}
		}()
	}
	var readErr error
	for iter.Next() {
		next, err := iter.GetRow()
		if err != nil {
			readErr = fmt.Errorf("reversegeocoder: decoding row %d: %w", stats.Read, err)
			break
		}
		stats.Read++
		ch <- next.(*models.GeocodedResult)
	}
	if readErr == nil {
		if err := iter.Err(); err != nil {
			readErr = fmt.Errorf("reversegeocoder: reading ipgeocode output: %w", err)
		}
	}
	close(ch)
	wg.Wait()
	wErr := writer.Close()
	stats.Written = writer.Written()
	stats.Matched = matched
	if readErr != nil {
		return stats, readErr
	}
	return stats, wErr
}
