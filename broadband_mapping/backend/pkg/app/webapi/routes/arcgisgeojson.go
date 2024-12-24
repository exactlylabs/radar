package routes

import (
	"fmt"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
)

// @Summary GeoJSON for ArcGIS
// @Description Returns GeoJSONs with broadband summarized data in a more friendly format for ArcGIS.
// @Tags Public
// @Param args query GeoJSONArgs true "query params"
// @Success 200 {object} arcGISGeoJSONResponseDefinition
// @Failure 400 {object} apierrors.RequestError
// @Router /arcgis-geojson [get]
func HandleGetGeoJSONArcGIS(ctx *webcontext.Context, conf *config.Config, servers *geo.GeoJSONServers, summaries storages.SummariesStorage) {
	useGzip := gzipAllowed(ctx)
	cacheKey := fmt.Sprintf("%s_%t", ctx.Request.URL.String(), useGzip)

	if v, err := geojsonCache.Get(cacheKey); err == nil && conf.UseCache() {
		if useGzip {
			ctx.ResponseHeader().Add("Content-Encoding", "gzip")
		}
		ctx.Write(v)
		return
	}

	args := &GeoJSONArgs{}
	args.Parse(ctx)
	if ctx.HasErrors() {
		return
	}

	collection := getGeoJSONCollection(ctx, servers)
	summaryMap, err := getSummary(summaries, args.PortNamespace(), args.ASNOrgId, args.SummaryFilter, false)
	if err != nil {
		panic(errors.Wrap(err, "routes.HandleGetGeoJSON getSummary"))
	}
	// Complement this collection's features with the measurement summary for each one
	mountArcGisGeoJSONProperties(summaryMap, collection)

	data := writeGeoJsonResponse(ctx, collection, useGzip)
	geojsonCache.Set(cacheKey, data)
}

func mountArcGisGeoJSONProperties(summaries map[string]storages.GeospaceSummaryResult, collection geo.GeoJSON) {
	for _, feature := range collection.GetFeatures() {
		props := feature.GetProperties()
		geospaceId, exists := props["ID"]

		if !exists || geospaceId == nil {
			continue
		}
		summary, exists := summaries[geospaceId.(string)]
		if exists {
			feature.SetProperty("geoid", summary.Geospace.GeoId)
			feature.SetProperty("download_median", summary.DownloadMedian)
			feature.SetProperty("upload_median", summary.UploadMedian)
			feature.SetProperty("latency_median", summary.LatencyMedian)
			feature.SetProperty("name", summary.Geospace.Name)
		}
	}
}

// arcGISGeoJSONResponseDefinition is used to declare the expected GeoJSON response for the ArcGIS endpoint.
type arcGISGeoJSONResponseDefinition struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Features []struct {
		Type       string         `json:"type"`
		Geometry   map[string]any `json:"geometry"`
		Properties struct {
			GeoID          string  `json:"geoid"`
			DownloadMedian float32 `json:"download_median"`
			LatencyMedian  float32 `json:"latency_median"`
			UploadMedian   float32 `json:"upload_median"`
			Name           string  `json:"name"`
		} `json:"properties"`
	} `json:"features"`
}
