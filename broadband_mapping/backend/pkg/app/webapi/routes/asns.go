package routes

import (
	"net/http"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/paginator"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

// To edit the swagger doc, see: https://github.com/swaggo/swag
// @Param id path string true "Geospace ID"
// @Param query query string  false "text to filter for"
// @Param args query paginator.PaginationArgs false "pagination arguments"
// @Success 200 {object} paginator.PaginatedResponse[storages.ASNOrg]
// @Failure 400 {object} apierrors.RequestError
// @Router /geospaces/{id}/asns [get]
func GeospaceASNs(ctx *webcontext.Context, asns storages.ASNOrgStorage) {
	geospaceId := ctx.UrlParameters()["id"]
	if ctx.HasErrors() {
		return
	}
	// TODO: move this to paginated response after scheduling the change with frontend
	response, err := paginator.New[*storages.ASNOrg]().Paginate(ctx, func(limit, offset int) (paginator.Iterator[*storages.ASNOrg], error) {
		query := ctx.QueryParams().Get("query")
		if query != "" {
			return asns.SearchFromGeospace(query, geospaceId, nil, nil)
		}
		return asns.AllFromGeospace(geospaceId, nil, nil)
	})
	if err != nil {
		panic(errors.Wrap(err, "GeospaceASNs Paginate"))
	}
	ctx.JSON(http.StatusOK, response)
}

// @Param query query string  false "text to filter for"
// @Param args query paginator.PaginationArgs false "pagination arguments"
// @Success 200 {object} paginator.PaginatedResponse[storages.ASNOrg]
// @Failure 400 {object} apierrors.RequestError
// @Router /asns [get]
func ListASNs(ctx *webcontext.Context, asns storages.ASNOrgStorage) {
	response, err := paginator.New[*storages.ASNOrg]().Paginate(ctx, func(limit, offset int) (paginator.Iterator[*storages.ASNOrg], error) {
		query := ctx.QueryParams().Get("query")
		if query != "" {
			return asns.Search(query, &limit, &offset)
		}
		return asns.All(&limit, &offset)
	})
	if err != nil {
		panic(errors.Wrap(err, "routes.ListASNs Paginate"))
	}
	ctx.JSON(http.StatusOK, response)
}
