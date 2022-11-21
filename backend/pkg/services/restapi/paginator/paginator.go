package paginator

import (
	"fmt"
	"net/url"
	"strconv"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi"
)

const (
	DEFAULT_PAGINATION_LIMIT = 100
)

type PaginationLinks struct {
	Next     *string `json:"next"`
	Previous *string `json:"previous"`
}

type PaginationArgs struct {
	Limit  *int `json:"limit"`
	Offset *int `json:"offset"`
}

func (pa *PaginationArgs) Parse(c *restapi.WebContext) {
	limit := DEFAULT_PAGINATION_LIMIT
	defaultOffset := 0
	pa.Limit = &limit
	pa.Offset = &defaultOffset
	limitStr := c.QueryParams().Get("limit")
	offsetStr := c.QueryParams().Get("offset")
	if limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err != nil {
			c.AddFieldError("limit", restapi.SingleFieldError(
				"not a valid integer", "invalid_format",
			))
		}
		pa.Limit = &l
	}
	if offsetStr != "" {
		o, err := strconv.Atoi(offsetStr)
		if err != nil {
			c.AddFieldError("offset", restapi.SingleFieldError(
				"not a valid integer", "invalid_format",
			))
		}
		pa.Offset = &o
	}
}

type PaginatedResponse[Obj interface{}] struct {
	Links   PaginationLinks `json:"_links"`
	Count   uint64          `json:"count"`
	Results []Obj           `json:"results"`
}

type Paginator[T any] struct {
	DefaultLimit  int
	DefaultOffset int
}

func New[T any]() *Paginator[T] {
	return &Paginator[T]{}
}

// Paginate mounts a PaginatedResponse.
// It expects a getPage function that receives limit and offset integers
// and returns an iterator, the total of rows and an error
func (pr *Paginator[T]) Paginate(c *restapi.WebContext, getPage func(limit, offset int) (Iterator[T], error)) (*PaginatedResponse[T], error) {
	args := &PaginationArgs{}
	args.Parse(c)
	if c.HasErrors() {
		return nil, nil
	}
	it, err := getPage(*args.Limit, *args.Offset)
	if err != nil {
		return nil, errors.Wrap(err, "Paginator#Paginate getPage")
	}
	count, err := it.Count()
	if err != nil {
		return nil, errors.Wrap(err, "Paginator#Paginate Count")
	}
	response := &PaginatedResponse[T]{
		Results: make([]T, 0),
		Count:   count,
	}
	for it.HasNext() {
		obj, err := it.GetRow()
		if err != nil {
			return nil, errors.Wrap(err, "Paginator#Paginate GetRow")
		}
		response.Results = append(response.Results, obj)
	}
	response.Links = paginationLink(c, *args.Limit, *args.Offset, count)
	return response, nil
}

func baseUrl(c *restapi.WebContext) *url.URL {
	u := *c.Request.URL
	u.Host = c.Request.Host
	if u.Scheme == "" {
		if c.Request.TLS != nil {
			u.Scheme = "https"
		} else {
			u.Scheme = "http"
		}
	}
	return &u
}

func paginationLink(c *restapi.WebContext, limit, offset int, count uint64) PaginationLinks {
	link := PaginationLinks{}

	if count > uint64(limit+offset) {
		newUrl := baseUrl(c)
		q := newUrl.Query()
		q.Set("offset", fmt.Sprintf("%d", limit+offset))
		newUrl.RawQuery = q.Encode()
		next := newUrl.String()
		link.Next = &next
	}
	if offset != 0 {
		newUrl := baseUrl(c)
		newOffset := offset - limit
		if newOffset < 0 {
			newOffset = 0
		}
		q := newUrl.Query()
		q.Set("offset", fmt.Sprintf("%d", newOffset))
		newUrl.RawQuery = q.Encode()
		prev := newUrl.String()
		link.Previous = &prev
	}
	return link
}
