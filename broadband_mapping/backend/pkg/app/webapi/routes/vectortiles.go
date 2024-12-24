package routes

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/apierrors"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
)

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
// @Tags Internal
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
