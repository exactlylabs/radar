package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/allegro/bigcache/v3"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/apierrors"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"golang.org/x/exp/slices"
)

var summariesCache *bigcache.BigCache
var geojsonCache *bigcache.BigCache

func init() {
	summariesCacheConf := bigcache.DefaultConfig(5 * time.Minute)
	summariesCacheConf.HardMaxCacheSize = 100e6 // 100MB
	var err error
	summariesCache, err = bigcache.New(context.Background(), summariesCacheConf)
	if err != nil {
		panic(err)
	}

	geojsonCacheConf := bigcache.DefaultConfig(1 * time.Hour)
	geojsonCacheConf.HardMaxCacheSize = 100e6 // 100MB
	geojsonCache, err = bigcache.New(context.Background(), geojsonCacheConf)
	if err != nil {
		panic(err)
	}
}

type GeoJSONArgs struct {
	Namespace string  `json:"namespace"`
	ASNOrgId  *string `json:"asn_id"`
	storages.SummaryFilter
}

func (gja *GeoJSONArgs) Parse(c *webcontext.Context) {
	ns := c.QueryParams().Get("namespace")
	asnOrgId := c.QueryParams().Get("asn_id")
	if !validateNamespace(ns, c) {
		return
	}
	if asnOrgId != "" {
		gja.ASNOrgId = &asnOrgId
	}
	gja.Namespace = ns
	gja.SummaryFilter = parseSummaryFilter(c)
}

func (gja *GeoJSONArgs) PortNamespace() namespaces.Namespace {
	switch gja.Namespace {
	case "states":
		return namespaces.US_STATE
	case "counties":
		return namespaces.US_COUNTY
	case "tribal_tracts":
		return namespaces.US_TTRACT
	default:
		return ""
	}
}

// To edit the swagger doc, see: https://github.com/swaggo/swag
// @Param args query GeoJSONArgs true "query params"
// @Success 200 {object} geo.GeoJSON
// @Failure 400 {object} apierrors.RequestError
// @Router /geojson [get]
func HandleGetGeoJSON(ctx *webcontext.Context, conf *config.Config, servers *geo.GeoJSONServers, summaries storages.SummariesStorage) {
	useGzip := gzipAllowed(ctx)
	cacheKey := fmt.Sprintf("%s_%t", ctx.Request.URL.String(), useGzip)
	for _, encoding := range ctx.Request.Header.Values("Accept-Encoding") {
		if encoding == "gzip" {
			useGzip = true
			break
		}
	}
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
	geoJsonServer, err := servers.Get(args.PortNamespace())
	if err == geo.ErrWrongNamespace {
		ctx.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "provided namespace is not supported",
			Code:    "namespace_not_found",
		})
		return
	} else if err != nil {
		panic(errors.Wrap(err, "routes.HandleGetGeoJSON Get"))
	}
	collection, err := geoJsonServer.Get()
	if err != nil {
		panic(errors.Wrap(err, "routes.HandleGetGeoJSON GetGeoJSON"))
	}
	if collection == nil {
		ctx.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "no available geojson for this query",
			Code:    "geojson_not_available",
		})
		return
	}

	summaryMap, err := getSummary(summaries, args.PortNamespace(), args.ASNOrgId, args.SummaryFilter, false)
	if err != nil {
		panic(errors.Wrap(err, "routes.HandleGetGeoJSON getSummary"))
	}
	// Complement this collection's features with the measurement summary for each one
	for _, feature := range collection.GetFeatures() {
		props := feature.GetProperties()
		geospaceId, exists := props["ID"]

		if !exists || geospaceId == nil {
			continue
		}
		summary, exists := summaryMap[geospaceId.(string)]
		if exists {
			feature.SetProperty("summary", summary)
		}
	}
	data, err := collection.Marshal(useGzip)
	if err != nil {
		panic(errors.Wrap(err, "routes.HandleGetGeoJSON MarshalJSON"))
	}
	if useGzip {
		ctx.ResponseHeader().Add("Content-Encoding", "gzip")
	}
	ctx.Write(data)
	geojsonCache.Set(cacheKey, data)
}

func parseSummaryFilter(c *webcontext.Context) storages.SummaryFilter {
	filter := storages.SummaryFilter{}
	if c.QueryParams().Has("year") {
		filter.Year = queryParamAsInt(c, "year")
	}
	if c.QueryParams().Has("semester") {
		filter.Semester = queryParamAsInt(c, "semester")
	}
	if c.QueryParams().Has("quarter") {
		filter.Quarter = queryParamAsInt(c, "quarter")
	}
	if c.QueryParams().Has("month") {
		filter.Month = queryParamAsInt(c, "month")
	}
	if c.QueryParams().Has("week") {
		filter.Week = queryParamAsInt(c, "week")
	}
	if filter.Semester != nil && filter.Year == nil {
		c.AddFieldError("year", apierrors.SingleFieldError(
			"is required to use semester filtering",
			"year_required",
		))
	}
	if filter.Quarter != nil && filter.Year == nil {
		c.AddFieldError("year", apierrors.SingleFieldError(
			"is required to use semester filtering",
			"year_required",
		))
	}
	if filter.Month != nil && filter.Year == nil {
		c.AddFieldError("year", apierrors.SingleFieldError(
			"is required to use month filtering",
			"year_required",
		))
	}
	if filter.Week != nil && filter.Year == nil {
		c.AddFieldError("year", apierrors.SingleFieldError(
			"is required to use week filtering",
			"year_required",
		))
	}
	return filter
}

func validateNamespace(ns string, c *webcontext.Context) bool {
	if ns == "" {
		c.AddFieldError("namespace", apierrors.MissingFieldError)
		return false
	}
	if !slices.Contains([]string{"states", "counties", "tribal_tracts"}, ns) {
		c.AddFieldError("namespace", apierrors.SingleFieldError(
			"is not a valid choice. Choose between [states, counties, tribal_tracts]",
			"invalid_choice",
		))
		return false
	}
	return true
}

type ServeVectorTilesArgs struct {
	ASNOrgId *string `json:"asn_id"`
	storages.SummaryFilter
}

func (gja *ServeVectorTilesArgs) Parse(c *webcontext.Context) {
	gja.SummaryFilter = parseSummaryFilter(c)
	asnId := c.QueryParams().Get("asn_id")
	if asnId != "" {
		gja.ASNOrgId = &asnId
	}
}

func convertNamespace(ns string) namespaces.Namespace {
	switch ns {
	case "states":
		return namespaces.US_STATE
	case "counties":
		return namespaces.US_COUNTY
	case "tribal_tracts":
		return namespaces.US_TTRACT
	default:
		return ""
	}
}

// To edit the swagger doc, see: https://github.com/swaggo/swag
// @Param namespace path string true "Namespace to return the tiles"
// @Param z path int true "zoom level"
// @Param x path int true "tile x position"
// @Param y path int true "tile y position"
// @Param args query ServeVectorTilesArgs true "query args"
// @Produce application/vnd.mapbox-vector-tile
// @Success 200 {string} string "encoded vector tile"
// @Failure 400 {object} apierrors.RequestError
// @Router /namespaces/{namespace}/tiles/{z}/{x}/{y} [get]
func ServeVectorTiles(ctx *webcontext.Context, conf *config.Config, servers *geo.TilesetServers, summaries storages.SummariesStorage) {
	useGzip := gzipAllowed(ctx)
	args := &ServeVectorTilesArgs{}
	args.Parse(ctx)
	ns := ctx.UrlParameters()["namespace"]
	validateNamespace(ns, ctx)
	if ctx.HasErrors() {
		return
	}
	namespace := convertNamespace(ns)
	tilesetServer, err := servers.Get(namespace)
	if err != nil {
		ctx.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "provided namespace is not supported",
			Code:    "namespace_not_found",
		})
		return
	}
	urlParams := ctx.UrlParameters()
	xStr := urlParams["x"]
	yStr := urlParams["y"]
	zStr := urlParams["z"]
	x, err := strconv.ParseUint(xStr, 10, 64)
	if err != nil {
		ctx.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "x must be an integer",
			Code:    "invalid_type_integer",
		})
		return
	}
	y, err := strconv.ParseUint(yStr, 10, 64)
	if err != nil {
		ctx.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "x must be an integer",
			Code:    "invalid_type_integer",
		})
		return
	}
	z, err := strconv.ParseUint(zStr, 10, 64)
	if err != nil {
		ctx.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "x must be an integer",
			Code:    "invalid_type_integer",
		})
		return
	}

	vt, err := tilesetServer.Get(x, y, z)
	if err == geo.ErrEmptyTile {
		return
	} else if err != nil {
		panic(errors.Wrap(err, "routes.ServeVectorTiles GetVectorTile"))
	}

	summaryMap, err := getSummary(summaries, namespace, args.ASNOrgId, args.SummaryFilter, conf.UseCache())
	if err != nil {
		panic(errors.Wrap(err, "routes.ServeVectorTiles getSummary"))
	}

	features, err := vt.GetFeatures(namespace)
	if err != nil {
		panic(errors.Wrap(err, "routes.ServeVectorTiles GetFeatures"))
	}
	for _, f := range features {
		geospaceId := f.GetProperties()["ID"].(string)
		if summary, exists := summaryMap[geospaceId]; exists {
			// If passing summary directly, the library fails to encode it
			// we need to pass a non-comparable type to it
			f.SetProperty("summary", map[string]any{
				"geospace":        summary.Geospace,
				"asn":             summary.ASNOrg,
				"download_median": summary.DownloadMedian,
				"upload_median":   summary.UploadMedian,
				"latency_median":  summary.LatencyMedian,
				"upload_scores":   summary.UploadScores,
				"download_scores": summary.DownloadScores,
			})
		}
	}

	vtData, err := vt.Marshal(useGzip)
	if err != nil {
		panic(errors.Wrap(err, "routes.ServeVectorTiles Marshal"))
	}

	ctx.ResponseHeader().Add("Content-Type", "application/vnd.mapbox-vector-tile")
	ctx.ResponseHeader().Add("Content-Length", fmt.Sprintf("%d", len(vtData)))
	if useGzip {
		ctx.ResponseHeader().Add("Content-Encoding", "gzip")
	}
	ctx.Write(vtData)
}

func getSummary(summaries storages.SummariesStorage, namespace namespaces.Namespace, asnOrgId *string, filter storages.SummaryFilter, useCache bool) (map[string]storages.GeospaceSummaryResult, error) {
	summaryMap := make(map[string]storages.GeospaceSummaryResult)
	key := cacheKey(namespace, asnOrgId, filter)
	if v, err := summariesCache.Get(key); err == nil && useCache {
		if err := json.Unmarshal(v, &summaryMap); err != nil {
			panic(errors.W(err))
		}
	} else {
		var err error
		var namespaceSummary []storages.GeospaceSummaryResult
		if asnOrgId != nil {
			namespaceSummary, err = summaries.SummaryForNamespaceAndASN(namespace, *asnOrgId, filter)
		} else {
			namespaceSummary, err = summaries.SummaryForNamespace(namespace, filter)
		}

		if err != nil {
			err = errors.Wrap(err, "routes.nsSummary GeoNamespaceSummary")
			return nil, err
		}
		for _, summary := range namespaceSummary {
			summaryMap[summary.Geospace.Id] = summary
		}
		summaryMapJson, err := json.Marshal(summaryMap)
		if err != nil {
			panic(errors.W(err))
		}
		summariesCache.Set(key, summaryMapJson)
	}
	return summaryMap, nil
}

func cacheKey(ns namespaces.Namespace, asn *string, filter storages.SummaryFilter) string {
	asnStr := ""
	if asn != nil {
		asnStr = *asn
	}
	return fmt.Sprintf("%s-%s-%s", ns, asnStr, filter)
}

func queryParamAsInt(ctx *webcontext.Context, key string) *int {
	val := ctx.QueryParams().Get(key)
	intVal, err := strconv.Atoi(val)
	if err != nil {
		ctx.AddFieldError(key, apierrors.FieldErrors{
			apierrors.APIError{
				Message: "is not a valid integer", Code: "invalid_int",
			},
		})
	}
	return &intVal
}

func gzipAllowed(ctx *webcontext.Context) bool {
	for _, encoding := range ctx.Request.Header.Values("Accept-Encoding") {
		if encoding == "gzip" {
			return true
		}
	}
	return false
}
