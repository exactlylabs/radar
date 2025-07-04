package routes

import (
	"net/http"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/apierrors"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

// To edit the swagger doc, see: https://github.com/swaggo/swag
// @Tags Internal
// @Param id path string true "Geospace ID"
// @Param asn_id query string false "Additionally filter by an ASN"
// @Param time query storages.SummaryFilter false "filters by time"
// @Success 200 {object} storages.GeospaceSummaryResult
// @Failure 400 {object} apierrors.RequestError
// @Router /geospaces/{id}/overview [get]
func GeospaceMeasurementsOverviewHandler(ctx *webcontext.Context, summaries storages.SummariesStorage, geospaces storages.GeospaceStorage, asns storages.ASNOrgStorage) {
	geospaceId := ctx.UrlParameters()["id"]
	filter := parseSummaryFilter(ctx)
	if ctx.HasErrors() {
		return
	}

	var res *storages.GeospaceSummaryResult
	var err error
	asnId := ctx.QueryParams().Get("asn_id")
	if asnId != "" {
		res, err = summaries.SummaryForGeoAndASN(
			geospaceId, asnId, filter,
		)
	} else {
		res, err = summaries.SummaryForGeospace(geospaceId, filter)
	}
	if err != nil {
		panic(errors.Wrap(err, "GeospaceMeasurementsOverviewHandler GeospaceSummary"))
	}
	if res.Geospace.Id == "" {
		g, err := geospaces.Get(geospaceId)
		if err == storages.ErrGeospaceNotFound {
			ctx.AddFieldError("id", apierrors.SingleFieldError(
				"not found", "not_found",
			))
			return
		} else if err != nil {
			panic(errors.Wrap(err, "routes.GeospaceMeasurementsOverviewHandler Get"))
		}
		res.Geospace = *g
	}
	if asnId != "" && res.ASNOrg == nil {
		a, err := asns.Get(asnId)
		if err == storages.ErrASNOrgNotFound {
			ctx.AddFieldError("id", apierrors.SingleFieldError(
				"not found", "not_found",
			))
			return
		} else if err != nil {
			panic(errors.Wrap(err, "routes.GeospaceMeasurementsOverviewHandler Get"))
		}
		res.ASNOrg = a
	}
	ctx.JSON(http.StatusOK, res)
}
