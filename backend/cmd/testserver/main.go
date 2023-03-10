package main

import (
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/paginator"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/webcontext"
)

func main() {
	server, err := restapi.NewWebServer()
	if err != nil {
		panic(err)
	}
	server.Route("/ping", Ping, "GET")
	server.Run("127.0.0.1:5000")
}

type it struct {
	c int
}

func (i *it) Count() (uint64, error) {
	return 4, nil
}

func (i *it) GetRow() (string, error) {
	i.c++
	return "Test", nil
}

func (i *it) HasNext() bool {
	return i.c < 2
}

func Ping(c *webcontext.Context) {
	p := paginator.New[string]()
	p.DefaultLimit = 2
	p.DefaultOffset = 0
	paginatedResp, err := p.Paginate(c, func(limit, offset int) (paginator.Iterator[string], error) {
		return &it{}, nil
	})
	if err != nil {
		panic(err)
	}
	c.JSON(200, paginatedResp)
}
