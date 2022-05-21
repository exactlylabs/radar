package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/exactlylabs/mlab-processor/pkg/services/geo"
	"github.com/exactlylabs/radar/fipsgeocoder/pkg/internal/config"
	"github.com/exactlylabs/radar/fipsgeocoder/pkg/internal/request"
	"github.com/jonas-p/go-shp"
)

func init() {
	index = geo.NewIndex()

	loadShape(COUNTIES_NS, config.LoadConfig().CountyShapePath)
	loadShape(STATES_NS, config.LoadConfig().StateShapePath)
}

type GeocoderResponse struct {
	CountyFIPS string `json:"county_fips"`
	StateFIPS  string `json:"state_fips"`
}

func GeocodeHandler(w http.ResponseWriter, req *http.Request) {
	ctx := request.NewRequestContext()
	query := req.URL.Query()
	latStr := query.Get("latitude")
	latitude, latErr := strconv.ParseFloat(latStr, 64)

	longStr := query.Get("longitude")
	longitude, longErr := strconv.ParseFloat(longStr, 64)

	if latStr == "" {
		ctx.AddFieldError("latitude", request.RequiredErrMessage, request.RequiredErrCode)
	} else if latErr != nil {
		ctx.AddFieldError("latitude", fmt.Sprintf("unable to convert %v to float", latStr), "invalid")
	}
	if longStr == "" {
		ctx.AddFieldError("longitude", request.RequiredErrMessage, request.RequiredErrCode)
	} else if longErr != nil {
		ctx.AddFieldError("latitude", fmt.Sprintf("unable to convert %v to float", longStr), "invalid")
	}

	if ctx.HasErrors() {
		w.WriteHeader(http.StatusBadRequest)
		writeError(ctx.Errors(), w)
		return
	}

	// Call Geocoder
	results := index.ContainingShapeID(&geo.Point{
		Lat: latitude,
		Lng: longitude,
	})
	response := GeocoderResponse{}
	for _, result := range results {
		if result.Namespace == "US_COUNTIES" {
			response.CountyFIPS = result.ExternalId
		} else if result.Namespace == "US_STATES" {
			response.StateFIPS = result.ExternalId
		}
	}
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		panic(fmt.Errorf("failed to marshal response: %w", err))
	}
}

func writeError(errs map[string][]request.ErrorMessage, w http.ResponseWriter) {
	errMsg, err := json.Marshal(errs)
	if err != nil {
		panic(fmt.Errorf("unable to marshal error message: %w", err))
	}
	w.Write(errMsg)
}

var index *geo.Index

const (
	STATES_NS   = "US_STATES"
	COUNTIES_NS = "US_COUNTIES"
)

func loadShape(namespace, filepath string) {
	// open a shapefile for reading
	shape, err := shp.Open(filepath)
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

			geoPoly := geo.NewPolygon(loopPoints)

			index.Add(namespace, geoid, geoPoly)
		}
	}
}
