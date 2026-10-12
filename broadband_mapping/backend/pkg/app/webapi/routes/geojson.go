package routes

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
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

var summariesCache *summaryMemo
var geojsonCache *bigcache.BigCache
var tilesCache *bigcache.BigCache

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
		setPublicCache(ctx, true)
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
	if collection == nil {
		return
	}
	summaryMap, err := getSummary(summaries, args.PortNamespace(), args.ASNOrgId, args.SummaryFilter, conf.UseCache())
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
	m, err := summariesCache.get(cacheKey(namespace, asnOrgId, filter), useCache, func() (summaryMap, error) {
		var namespaceSummary []storages.GeospaceSummaryResult
		var err error
		if asnOrgId != nil {
			namespaceSummary, err = summaries.SummaryForNamespaceAndASN(namespace, *asnOrgId, filter)
		} else {
			namespaceSummary, err = summaries.SummaryForNamespace(namespace, filter)
		}
		if err != nil {
			return nil, err
		}
		summaryMap := make(summaryMap, len(namespaceSummary))
		for _, summary := range namespaceSummary {
			summaryMap[summary.Geospace.Id] = summary
		}
		return summaryMap, nil
	})
	if err != nil {
		return nil, errors.Wrap(err, "routes.getSummary GeoNamespaceSummary")
	}
	return m, nil
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

// gzipAllowed reports whether the client accepts a gzip body. Browsers send a list
// ("gzip, deflate, br"), so each header value is split into its codings; "gzip;q=0" refuses it.
func gzipAllowed(ctx *webcontext.Context) bool {
	for _, value := range ctx.Request.Header.Values("Accept-Encoding") {
		for _, coding := range strings.Split(value, ",") {
			parts := strings.Split(coding, ";")
			if !strings.EqualFold(strings.TrimSpace(parts[0]), "gzip") {
				continue
			}
			for _, param := range parts[1:] {
				param = strings.ReplaceAll(strings.TrimSpace(param), " ", "")
				if strings.HasPrefix(param, "q=") {
					if f, err := strconv.ParseFloat(param[2:], 64); err == nil && f == 0 {
						return false
					}
				}
			}
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
	setPublicCache(ctx, true)
	if gzip {
		ctx.ResponseHeader().Add("Content-Encoding", "gzip")
	}
	ctx.Write(data)

	return data
}

func init() {
	// Decoded namespace summaries. A counties summary is a few MB, so keep a bounded number.
	summariesCache = newSummaryMemo(5*time.Minute, 64)

	// Note: HardMaxCacheSize is in MB (the old 100e6 meant unbounded), and an entry must fit in
	// one shard (HardMaxCacheSize / Shards): a whole-namespace GeoJSON can be tens of MB.
	geojsonCacheConf := bigcache.DefaultConfig(1 * time.Hour)
	geojsonCacheConf.Shards = 4
	geojsonCacheConf.MaxEntriesInWindow = 256
	geojsonCacheConf.MaxEntrySize = 256 * 1024
	geojsonCacheConf.HardMaxCacheSize = 384
	var err error
	geojsonCache, err = bigcache.New(context.Background(), geojsonCacheConf)
	if err != nil {
		panic(err)
	}

	tilesCacheConf := bigcache.DefaultConfig(30 * time.Minute)
	tilesCacheConf.Shards = 64
	tilesCacheConf.MaxEntriesInWindow = 4096
	tilesCacheConf.MaxEntrySize = 16 * 1024
	tilesCacheConf.HardMaxCacheSize = 256
	tilesCacheConf.Verbose = false
	tilesCache, err = bigcache.New(context.Background(), tilesCacheConf)
	if err != nil {
		panic(err)
	}
}
