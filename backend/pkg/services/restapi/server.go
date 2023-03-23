package restapi

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"reflect"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi/dependencies"
	"github.com/exactlylabs/go-rest/pkg/restapi/paginator"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/gorilla/mux"
)

type DependencyProvider func(ctx *webcontext.Context) any

type WebServer struct {
	server             *http.Server
	middlewares        []Middleware
	recoveryMiddleware Middleware
	loggerMiddleware   Middleware
	router             *mux.Router
	baseCtx            *webcontext.Context
	routes             []any
	dependencies       map[reflect.Type]DependencyProvider
	setupCalled        bool
}

func NewWebServer(options ...ServerOption) (*WebServer, error) {
	server := &WebServer{
		middlewares:        make([]Middleware, 0),
		recoveryMiddleware: RecoveryMiddleware,
		loggerMiddleware:   RequestLoggerMiddleware,
		router:             mux.NewRouter(),
		routes:             make([]any, 0),
		baseCtx:            webcontext.New(),
		dependencies:       make(map[reflect.Type]DependencyProvider),
	}
	for _, opt := range options {
		err := opt(server)
		if err != nil {
			return nil, errors.Wrap(err, "restapi.NewWebServer %T", opt)
		}
	}
	server.AddDependency(dependencies.PaginationArgsProvider, &paginator.PaginationArgs{})
	return server, nil
}

func (w *WebServer) validateRoute(route any) {
	routeType := reflect.TypeOf(route)
	if routeType.Kind() != reflect.Func {
		panic(fmt.Errorf("restapi.WebServer#validateRoute Route must be a function"))
	}
	if routeType.NumIn() == 0 {
		panic(fmt.Errorf("restapi.WebServer#validateroute Route must have at least one argument of type *WebContext"))
	}
	if routeType.In(0).Kind() != reflect.Ptr || routeType.In(0) == reflect.TypeOf(webcontext.Context{}) {
		panic(fmt.Errorf("restapi.WebServer#validateRoute Route first argument must be of type *WebContext, got %s", routeType.In(0)))
	}
}

func (w *WebServer) callRoute(ctx *webcontext.Context, route any) {
	routeType := reflect.TypeOf(route)
	args := []reflect.Value{reflect.ValueOf(ctx)}
	for i := 1; i < routeType.NumIn(); i++ {
		depType := routeType.In(i)
		if depType.Kind() == reflect.Ptr {
			depType = depType.Elem()
		}
		provider := w.dependencies[depType]
		args = append(args, reflect.ValueOf(provider(ctx)))
	}
	reflect.ValueOf(route).Call(args)
}

// Register a new endpoint to be routed to the given route function
func (w *WebServer) Route(endpoint string, route any, methods ...string) {
	if len(methods) == 0 {
		methods = []string{"GET"}
	}
	w.validateRoute(route)
	w.router.HandleFunc(endpoint, func(writer http.ResponseWriter, r *http.Request) {
		ctx := w.baseCtx.PrepareRequest(writer, r)
		w.callRoute(ctx, route)
		//route(ctx)
		if err := ctx.Commit(); err != nil {
			panic(errors.Wrap(err, "WebServer#Route Commit"))
		}
	}).Methods(methods...)
	w.routes = append(w.routes, route)
}

// AddMiddlewares adds layers of handler functions to an existing route.
// Note that the ordering matters here, so the first argument is going to be called first
// Important Note: NewRequestLoggerMiddleware and NewRecoveryMiddleware
// are set separatedly, and always at start.
func (w *WebServer) AddMiddlewares(middlewares ...Middleware) {
	w.middlewares = append(w.middlewares, middlewares...)
}

func (w *WebServer) validateRoutesDependencies() {
	for _, route := range w.routes {
		routeType := reflect.TypeOf(route)
		for i := 1; i < routeType.NumIn(); i++ {
			argType := routeType.In(i)
			if argType.Kind() == reflect.Ptr {
				argType = argType.Elem()
			}
			if _, exists := w.dependencies[argType]; !exists {
				panic(fmt.Errorf("restapi.WebServer validateRoutesDependencies type %s provider not found", argType))
			}
		}
	}
}

func (w *WebServer) setup() {
	w.validateRoutesDependencies()
	var handler http.Handler = w.router
	for _, middleware := range w.middlewares {
		handler = middleware(handler)
	}
	// Ensure the first middlewares are always the logging and recovery
	handler = w.loggerMiddleware(w.recoveryMiddleware(handler))
	w.server = &http.Server{
		Handler: handler,
	}
	w.setupCalled = true
}

func (w *WebServer) Run(addr string) error {
	if !w.setupCalled {
		w.setup()
	}
	w.server.Addr = addr
	log.Printf("Web Service Listening at address: %v\n", addr)
	if err := w.server.ListenAndServe(); err != http.ErrServerClosed {
		return errors.Wrap(err, "WebServer#Run ListenAndServe")
	}
	return nil
}

func (w *WebServer) ServeHTTP(writer http.ResponseWriter, r *http.Request) {
	w.server.Handler.ServeHTTP(writer, r)
}

func (w *WebServer) Shutdown(ctx context.Context) error {
	if err := w.server.Shutdown(ctx); err != nil {
		panic(errors.Wrap(err, "WebServer#Shutdown"))
	}
	return nil
}

func (w *WebServer) AddToContext(key string, value any) {
	w.baseCtx.SetValue(key, value)
}

func (w *WebServer) AddDependency(provider DependencyProvider, objProto any) {
	dependencyType := reflect.TypeOf(objProto)
	if dependencyType.Kind() == reflect.Ptr {
		dependencyType = dependencyType.Elem()
	}
	if _, exists := w.dependencies[dependencyType]; exists {
		panic(fmt.Errorf("restapi.WebServer#AddDependency %s already added", dependencyType))
	}
	w.dependencies[dependencyType] = provider
}
