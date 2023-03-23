package dependencies

import (
	"github.com/exactlylabs/go-rest/pkg/restapi/paginator"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
)

func PaginationArgsProvider(ctx *webcontext.Context) any {
	args := &paginator.PaginationArgs{}
	args.Parse(ctx)
	return args
}
