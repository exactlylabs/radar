package reversegeocoder

import (
	"fmt"
	"log"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders/avro"
	"github.com/exactlylabs/mlab-processor/pkg/services/geo"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
	hamba "github.com/hamba/avro/v2"
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

type ring struct {
	geoid  string
	points []geo.Point
}

// readShapes returns the rings of a shapefile in file order.
func readShapes(shpPath string) ([]ring, error) {
	dotPaths := strings.Split(shpPath, ".")
	if len(dotPaths) == 0 || (dotPaths[len(dotPaths)-1] != "zip" && dotPaths[len(dotPaths)-1] != "shp") {
		return nil, fmt.Errorf("%s must have a .shp or .zip extension", shpPath)
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
		return nil, fmt.Errorf("reversegeocoder.readShapes %s: %w", shpPath, err)
	}
	defer shape.Close()

	// fields from the attribute table (DBF)
	fields := shape.Fields()
	geoidField := -1
	for k, f := range fields {
		if f.String() == "GEOID" || f.String() == "GEOID20" || f.String() == "ORG_CODE" {
			geoidField = k
			break
		}
	}

	var rings []ring
	// loop through all features in the shapefile
	for shape.Next() {
		_, p := shape.Shape()

		poly, ok := p.(*shp.Polygon)
		if !ok {
			return nil, fmt.Errorf("reversegeocoder.readShapes %s: unexpected shape type %T", shpPath, p)
		}

		var geoid string
		if geoidField >= 0 {
			geoid = shape.Attribute(geoidField)
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
			rings = append(rings, ring{geoid: geoid, points: loopPoints})
		}
	}
	if err := shape.Err(); err != nil {
		return nil, fmt.Errorf("reversegeocoder.readShapes %s: %w", shpPath, err)
	}
	return rings, nil
}

// Load builds the shape index from SHAPE_PATHS (kept namespaces only). The files are
// parsed concurrently; the index is filled in SHAPE_PATHS order (sorted by namespace),
// so the output order of a test's shapes does not depend on timing.
func Load(conf *config.ProcessorConfig) (*ReverseGeocoder, error) {
	defer timer.TimeIt(time.Now(), "ReverseGeocodeLoad")
	entries := shapePathEntries(conf)
	rings := make([][]ring, len(entries))
	errs := make([]error, len(entries))
	var wg sync.WaitGroup
	for i, e := range entries {
		log.Printf("ReverseGeocoder - Loading %s from file %s\n", e.namespace, e.path)
		wg.Add(1)
		go func(i int, path string) {
			defer wg.Done()
			rings[i], errs[i] = readShapes(path)
		}(i, e.path)
	}
	wg.Wait()
	for _, err := range errs {
		if err != nil {
			return nil, err
		}
	}
	// The polygons' edge indexes are the expensive part: build them in parallel.
	polys := make([][]*geo.Polygon, len(entries))
	for i := range rings {
		polys[i] = make([]*geo.Polygon, len(rings[i]))
	}
	var next atomic.Int64
	total := 0
	for _, rs := range rings {
		total += len(rs)
	}
	workers := 8
	wg.Add(workers)
	for w := 0; w < workers; w++ {
		go func() {
			defer wg.Done()
			for {
				n := int(next.Add(1) - 1)
				if n >= total {
					return
				}
				i := 0
				for n >= len(rings[i]) {
					n -= len(rings[i])
					i++
				}
				polys[i][n] = geo.NewPolygon(rings[i][n].points)
			}
		}()
	}
	wg.Wait()
	index := geo.NewIndex()
	for i, e := range entries {
		for j, r := range rings[i] {
			index.Add(e.namespace, r.geoid, polys[i][j])
		}
	}
	log.Printf("ReverseGeocoder - Index Initialized (%d rings)", index.Len())
	return &ReverseGeocoder{index: index}, nil
}

// ReverseGeocode writes one row per (test, containing shape) of geocodeDS to ds, in the
// order of the input rows, using every CPU.
func (rg *ReverseGeocoder) ReverseGeocode(ds datastore.DataStore, geocodeDS datastore.DataStore, date time.Time) (*Stats, error) {
	defer timer.TimeIt(time.Now(), "ReverseGeocode")
	stats := &Stats{}
	fw, ok := ds.(datastore.FileWriterStore)
	if !ok {
		return stats, fmt.Errorf("reversegeocoder: %T cannot write files", ds)
	}
	in, err := geocodeDS.FileReader()
	if err != nil {
		return stats, fmt.Errorf("reversegeocoder: reading ipgeocode output: %w", err)
	}
	defer in.Close()
	reader, err := avro.NewBlockReader(in)
	if err != nil {
		return stats, fmt.Errorf("reversegeocoder: reading ipgeocode output: %w", err)
	}
	out, err := fw.FileWriter()
	if err != nil {
		return stats, fmt.Errorf("reversegeocoder: %w", err)
	}
	schema := hamba.MustParse(models.RevGeoResultSchema)
	writer, err := avro.NewBlockWriter(out, schema, avro.DefaultCodec())
	if err != nil {
		out.Close()
		return stats, fmt.Errorf("reversegeocoder: %w", err)
	}

	var matched atomic.Int64
	tStats, err := avro.Transform(reader, writer, schema, avro.TransformOptions{},
		func(worker int, rows []models.GeocodedResult, emit func(*models.RevGeoResult)) error {
			var results []geo.NamespaceAndExternalId
			var n int64
			var rr models.RevGeoResult
			for i := range rows {
				r := &rows[i]
				results = rg.index.AppendContaining(results[:0], &geo.Point{Lat: r.Latitude, Lng: r.Longitude})
				if len(results) > 0 {
					n++
				}
				for _, result := range results {
					rr = models.RevGeoResult{
						GeoNamespace: result.Namespace,
						Id:           r.Id,
						GeoId:        result.ExternalId,
						StartedAt:    r.StartedAt,
					}
					emit(&rr)
				}
			}
			matched.Add(n)
			return nil
		})
	stats.Read, stats.Written, stats.Matched = tStats.Read, tStats.Written, matched.Load()
	if cErr := out.Close(); err == nil && cErr != nil {
		err = fmt.Errorf("reversegeocoder: closing output: %w", cErr)
	}
	if err != nil {
		return stats, fmt.Errorf("reversegeocoder: %w", err)
	}
	return stats, nil
}
