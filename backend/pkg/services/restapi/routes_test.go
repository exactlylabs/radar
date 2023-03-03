package restapi

import (
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/paginator"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/webcontext"
)

func TestRouteWithoutContextValidated(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Errorf("expected to panic")
		}
	}()
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	route := func() {}
	api.Route("/test", route)
}

func TestRouteWithContextValid(t *testing.T) {
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	route := func(ctx *webcontext.Context) {}
	api.Route("/test", route)
}

func TestRouteWithContextAndDependencies(t *testing.T) {
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	type testDep struct{}
	route := func(ctx *webcontext.Context, test testDep) {}
	api.Route("/test", route)
}

func TestRouteWithDependencyOnly(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Errorf("expected to panic")
		}
	}()
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	type testDep struct{}
	route := func(test testDep) {}
	api.Route("/test", route)
}

func TestRouteWithNotRegisteredDependency(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Errorf("expected to panic")
		}
	}()
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	type testDep struct{}
	route := func(ctx *webcontext.Context, test testDep) {}
	api.Route("/test", route)

	api.setup()
}

func TestRouteWithRegisteredDependency(t *testing.T) {
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	type testDep struct{}
	provider := func(ctx *webcontext.Context) any {
		return &testDep{}
	}
	route := func(ctx *webcontext.Context, test testDep) {}
	api.Route("/test", route)
	api.AddDependency(provider, testDep{})
	api.setup()
}

func TestDependencyAlreadyRegistered(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Errorf("expected to panic")
		}
	}()
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	type testDep struct{}
	provider := func(ctx *webcontext.Context) any {
		return &testDep{}
	}
	api.AddDependency(provider, testDep{})
	api.AddDependency(provider, testDep{})
	api.setup()
}

func TestCallRouteWithDependency(t *testing.T) {
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	type testDep struct{}
	providerCalled := false
	provider := func(ctx *webcontext.Context) any {
		providerCalled = true
		return &testDep{}
	}
	routeCalled := false
	route := func(ctx *webcontext.Context, test *testDep) {
		routeCalled = true
	}

	api.Route("/test", route)
	api.AddDependency(provider, testDep{})
	api.setup()

	api.callRoute(api.baseCtx, route)
	if !providerCalled {
		t.Errorf("Expected provider to be called!")
	}
	if !routeCalled {
		t.Errorf("Expected route to be called!")
	}
}

func TestCallRouteWithMultipleDeps(t *testing.T) {
	api, err := NewWebServer()
	if err != nil {
		panic(err)
	}
	type testDep1 struct{}
	type testDep2 struct{}

	provider1Called := false
	provider2Called := false

	provider1 := func(ctx *webcontext.Context) any {
		provider1Called = true
		return &testDep1{}
	}
	provider2 := func(ctx *webcontext.Context) any {
		provider2Called = true
		return &testDep2{}
	}
	routeCalled := false
	route := func(ctx *webcontext.Context, test1 *testDep1, test2 *testDep2) {
		routeCalled = true
	}
	api.Route("/test", route)
	api.AddDependency(provider1, testDep1{})
	api.AddDependency(provider2, testDep2{})
	api.setup()

	api.callRoute(api.baseCtx, route)
	if !provider1Called {
		t.Errorf("Expected provider1 to be called!")
	}
	if !provider2Called {
		t.Errorf("Expected provider2 to be called!")
	}
	if !routeCalled {
		t.Errorf("Expected route to be called!")
	}
}

func TestRouteWithDefaultPaginationArgsProvider(t *testing.T) {
	writer := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)
	queryArgs := url.Values{
		"limit":  []string{"13"},
		"offset": []string{"26"},
	}
	req.URL.RawQuery = queryArgs.Encode()
	ctx := webcontext.NewTestContext(writer, req)

	api, _ := NewWebServer()
	route := func(ctx *webcontext.Context, args *paginator.PaginationArgs) {
		if *args.Limit != 13 {
			t.Errorf("*pArgs.Limit expected 13 got %v", *args.Limit)
		}
		if *args.Offset != 26 {
			t.Errorf("*pArgs.Offset expected 26 got %v", *args.Limit)
		}
	}
	api.Route("/test", route)
	api.callRoute(ctx, route)
}
