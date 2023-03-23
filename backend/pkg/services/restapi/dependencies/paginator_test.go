package dependencies

import (
	"io/ioutil"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/exactlylabs/go-rest/pkg/restapi/paginator"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
)

func TestPaginationArgsProvider(t *testing.T) {
	writer := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)
	queryArgs := url.Values{
		"limit":  []string{"13"},
		"offset": []string{"26"},
	}
	req.URL.RawQuery = queryArgs.Encode()
	ctx := webcontext.NewTestContext(writer, req)

	args := PaginationArgsProvider(ctx)
	if ctx.HasErrors() {
		ctx.Commit()
		body, _ := ioutil.ReadAll(writer.Result().Body)
		t.Errorf("failed to parse with error: %s", string(body))
		return
	}

	if pArgs, ok := args.(paginator.PaginationArgs); ok {
		if *pArgs.Limit != 13 {
			t.Errorf("*pArgs.Limit expected 13 got %v", *pArgs.Limit)
		}
		if *pArgs.Offset != 26 {
			t.Errorf("*pArgs.Offset expected 26 got %v", *pArgs.Limit)
		}
	}
}
