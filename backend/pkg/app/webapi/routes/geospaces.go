package routes

import (
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/paginator"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

type ListNamespaceGeospacesResult struct {
	Results []storages.DetailedGeospace `json:"results"`
}

// @Param namespace path string  true "namespace to list"
// @Param query query string  false "text to filter for"
// @Success 200 {object} ListNamespaceGeospacesResult
// @Router /namespaces/{namespace}/geospaces [get]
func ListNamespaceGeospaces(c *webcontext.Context) {
	geospaces := c.MustGetValue("geospacesStorage").(storages.GeospaceStorage)
	ns := c.UrlParameters()["namespace"]
	validateNamespace(ns, c)
	if c.HasErrors() {
		return
	}
	namespace := convertNamespace(ns)
	response := &ListNamespaceGeospacesResult{
		Results: make([]storages.DetailedGeospace, 0),
	}
	query := c.QueryParams().Get("query")
	var it storages.Iterator[*storages.DetailedGeospace]
	var err error
	// TODO: Move to Paginated Response
	if query == "" {
		it, err = geospaces.AllFromNamespace(namespace, nil, nil)
	} else {
		it, err = geospaces.SearchFromNamespace(query, namespace, nil, nil)
	}
	if err != nil {
		panic(errors.Wrap(err, "routes.ListNamespaceGeospaces Geospaces"))
	}
	for it.HasNext() {
		g, err := it.GetRow()
		if err != nil {
			panic(errors.Wrap(err, "routes.ListNamespaceGeospaces GetRow"))
		}
		response.Results = append(response.Results, *g)
	}
	c.JSON(200, response)
}

// @Param query query string  false "text to filter for"
// @Param args query paginator.PaginationArgs false "pagination arguments"
// @Success 200 {object} paginator.PaginatedResponse[storages.DetailedGeospace]
// @Router /geospaces [get]
func ListAllGeospaces(c *webcontext.Context) {
	geospaces := c.MustGetValue("geospacesStorage").(storages.GeospaceStorage)
	p := paginator.New[*storages.DetailedGeospace]()
	response, err := p.Paginate(c, func(limit int, offset int) (paginator.Iterator[*storages.DetailedGeospace], error) {
		query := c.QueryParams().Get("query")
		if query == "" {
			return geospaces.All(&limit, &offset)
		} else {
			return geospaces.Search(query, &limit, &offset)
		}
	})
	if err != nil {
		panic(errors.Wrap(err, "routes.ListAllGeospaces Paginate"))
	} else if response == nil {
		return
	}
	c.JSON(200, response)
}
