package dependencies

import (
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/paginator"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/webcontext"
)

func PaginationArgsProvider(ctx *webcontext.Context) any {
	args := &paginator.PaginationArgs{}
	args.Parse(ctx)
	return args
}
