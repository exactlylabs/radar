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

type GeoJSONArgs struct {
	Namespace string  `json:"namespace" validate:"required" enums:"states,counties,tribal_tracts"`
	ASNOrgId  *string `json:"asn_id" format:"uuid"` // Id from the ASNs list endpoint
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
// @Tags Internal
// @Param args query GeoJSONArgs true "query params"
// @Success 200 {object} geo.GeoJSON
// @Failure 400 {object} apierrors.RequestError
// @Router /geojson [get]
func HandleGetGeoJSON(ctx *webcontext.Context, conf *config.Config, servers *geo.GeoJSONServers, summaries storages.SummariesStorage) {
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
	mountGeoJSONProperties(summaryMap, collection)

	data := writeGeoJsonResponse(ctx, collection, useGzip)
	geojsonCache.Set(cacheKey, data)
}

// ##### Helper Functions ###### //

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

func getGeoJSONCollection(ctx *webcontext.Context, servers *geo.GeoJSONServers) geo.GeoJSON {
	args := &GeoJSONArgs{}
	args.Parse(ctx)
	if ctx.HasErrors() {
		return nil
	}
	geoJsonServer, err := servers.Get(args.PortNamespace())
	if err == geo.ErrWrongNamespace {
		ctx.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "provided namespace is not supported",
			Code:    "namespace_not_found",
		})
		return nil
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
		return nil
	}

	return collection
}

func mountGeoJSONProperties(summaries map[string]storages.GeospaceSummaryResult, collection geo.GeoJSON) {
	// Complement this collection's features with the measurement summary for each one
	for _, feature := range collection.GetFeatures() {
		props := feature.GetProperties()
		geospaceId, exists := props["ID"]

		if !exists || geospaceId == nil {
			continue
		}
		summary, exists := summaries[geospaceId.(string)]
		if exists {
			feature.SetProperty("summary", summary)
		}
	}
}

func writeGeoJsonResponse(ctx *webcontext.Context, collection geo.GeoJSON, gzip bool) []byte {
	data, err := collection.Marshal(gzip)
	if err != nil {
		panic(errors.Wrap(err, "routes.HandleGetGeoJSON MarshalJSON"))
	}
	if gzip {
		ctx.ResponseHeader().Add("Content-Encoding", "gzip")
	}
	ctx.Write(data)

	return data
}

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
