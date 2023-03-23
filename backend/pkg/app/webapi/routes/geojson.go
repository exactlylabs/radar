package routes

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/apierrors"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/cache"
	"golang.org/x/exp/slices"
)

var summariesCache cache.Cache
var geojsonCache cache.Cache

func init() {
	summariesCache = cache.New()
	geojsonCache = cache.New()
}

type GeoJSONArgs struct {
	Namespace string  `json:"namespace"`
	ASNOrgId  *string `json:"asn_id"`
	storages.SummaryFilter
}

func (gja *GeoJSONArgs) Parse(c *webcontext.Context) {
	ns := c.QueryParams().Get("namespace")
	asnOrgId := c.QueryParams().Get("asn_id")
	if asnOrgId != "" {
		gja.ASNOrgId = &asnOrgId
	}
	gja.Namespace = validateNamespace(ns, c)
	gja.SummaryFilter = validateTimeFilter(c)
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

// @Param args query GeoJSONArgs true "query params"
// @Success 200 {object} geo.GeoJSON
// @Failure 400 {object} restapi.FieldsValidationError
// @Router /geojson [get]
func HandleGetGeoJSON(c *webcontext.Context, conf *config.Config, servers *geo.GeoJSONServers, summaries storages.SummariesStorage) {
	cacheKey := c.Request.URL.String()
	if v, exists := geojsonCache.Get(cacheKey); exists && conf.UseCache() {
		c.ResponseHeader().Add("Content-Encoding", "gzip")
		c.Write(v.([]byte))
		return
	}
	args := &GeoJSONArgs{}
	args.Parse(c)
	if c.HasErrors() {
		return
	}
	geoJsonServer, err := servers.Get(args.PortNamespace())
	if err == geo.ErrWrongNamespace {
		c.Reject(http.StatusBadRequest, &apierrors.APIError{
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
		c.Reject(http.StatusBadRequest, &apierrors.APIError{
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
	data, err := collection.Marshal(true)
	if err != nil {
		panic(errors.Wrap(err, "routes.HandleGetGeoJSON MarshalJSON"))
	}
	c.ResponseHeader().Add("Content-Encoding", "gzip")
	c.Write(data)
	geojsonCache.Set(cacheKey, data, time.Hour)
}

func validateTimeFilter(c *webcontext.Context) storages.SummaryFilter {
	filter := storages.SummaryFilter{}
	if c.QueryParams().Has("year") {
		filter.Year = toInt(c, "year")
	}
	if c.QueryParams().Has("semester") {
		filter.Semester = toInt(c, "semester")
	}
	if c.QueryParams().Has("quarter") {
		filter.Quarter = toInt(c, "quarter")
	}
	if c.QueryParams().Has("month") {
		filter.Month = toInt(c, "month")
	}
	if c.QueryParams().Has("week") {
		filter.Week = toInt(c, "week")
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

func validateNamespace(ns string, c *webcontext.Context) string {
	if ns == "" {
		c.AddFieldError("namespace", apierrors.MissingFieldError)
		return ""
	}
	if !slices.Contains([]string{"states", "counties", "tribal_tracts"}, ns) {
		c.AddFieldError("namespace", apierrors.SingleFieldError(
			"is not a valid choice. Choose between [states, counties, tribal_tracts]",
			"invalid_choice",
		))
		return ""
	}
	return ns
}

type ServeVectorTilesArgs struct {
	ASNOrgId *string `json:"asn_id"`
	storages.SummaryFilter
}

func (gja *ServeVectorTilesArgs) Parse(c *webcontext.Context) {
	gja.SummaryFilter = validateTimeFilter(c)
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

// @Param namespace path string true "Namespace to return the tiles"
// @Param z path int true "zoom level"
// @Param x path int true "tile x position"
// @Param y path int true "tile y position"
// @Param args query ServeVectorTilesArgs true "query args"
// @Produce application/vnd.mapbox-vector-tile
// @Success 200 {string} string "encoded vector tile"
// @Failure 400 {object} restapi.FieldsValidationError
// @Router /namespaces/{namespace}/tiles/{z}/{x}/{y} [get]
func ServeVectorTiles(c *webcontext.Context, conf *config.Config, servers *geo.TilesetServers, summaries storages.SummariesStorage) {
	start := time.Now()
	args := &ServeVectorTilesArgs{}
	args.Parse(c)
	ns := c.UrlParameters()["namespace"]
	validateNamespace(ns, c)
	if c.HasErrors() {
		return
	}
	namespace := convertNamespace(ns)
	tilesetServer, err := servers.Get(namespace)
	if err != nil {
		c.Reject(http.StatusBadRequest, &apierrors.APIError{
			Message: "provided namespace is not supported",
			Code:    "namespace_not_found",
		})
	}
	urlParams := c.UrlParameters()
	xStr := urlParams["x"]
	yStr := urlParams["y"]
	zStr := urlParams["z"]
	x, _ := strconv.ParseUint(xStr, 10, 64)
	y, _ := strconv.ParseUint(yStr, 10, 64)
	z, _ := strconv.ParseUint(zStr, 10, 64)
	fmt.Println("Time for validation:", time.Since(start))
	start = time.Now()
	vt, err := tilesetServer.Get(x, y, z)
	if err == geo.ErrEmptyTile {
		return
	} else if err != nil {
		panic(errors.Wrap(err, "routes.ServeVectorTiles GetVectorTile"))
	}
	fmt.Println("Time to load VT:", time.Since(start))
	start = time.Now()
	summaryMap, err := getSummary(summaries, namespace, args.ASNOrgId, args.SummaryFilter, conf.UseCache())
	if err != nil {
		panic(errors.Wrap(err, "routes.ServeVectorTiles getSummary"))
	}

	fmt.Println("Time to load summary results:", time.Since(start))
	start = time.Now()
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
	fmt.Println("Time to add properies:", time.Since(start))
	start = time.Now()
	vtData, err := vt.Marshal(true)
	if err != nil {
		panic(errors.Wrap(err, "routes.ServeVectorTiles Marshal"))
	}
	fmt.Println("Time to encode:", time.Since(start))
	start = time.Now()
	c.ResponseHeader().Add("Content-Type", "application/vnd.mapbox-vector-tile")
	c.ResponseHeader().Add("Content-Length", fmt.Sprintf("%d", len(vtData)))
	c.ResponseHeader().Add("Content-Encoding", "gzip")
	c.Write(vtData)
	fmt.Println("Time to write", time.Since(start))
}

func getSummary(summaries storages.SummariesStorage, namespace namespaces.Namespace, asnOrgId *string, filter storages.SummaryFilter, useCache bool) (map[string]storages.GeospaceSummaryResult, error) {
	summaryMap := make(map[string]storages.GeospaceSummaryResult)
	key := cacheKey(namespace, asnOrgId, filter)
	if v, exists := summariesCache.Get(key); exists && useCache {
		summaryMap = v.(map[string]storages.GeospaceSummaryResult)
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
		summariesCache.Set(key, summaryMap, time.Minute*5)
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
