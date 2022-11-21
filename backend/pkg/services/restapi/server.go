package restapi

import (
	"context"
	"log"
	"net/http"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/gorilla/mux"
)

type RouteHandler func(ctx *WebContext)

type WebServer struct {
	server             *http.Server
	middlewares        []Middleware
	recoveryMiddleware Middleware
	loggerMiddleware   Middleware
	router             *mux.Router
	baseCtx            *WebContext
}

func NewWebServer(options ...ServerOption) (*WebServer, error) {
	server := &WebServer{
		middlewares:        make([]Middleware, 0),
		recoveryMiddleware: NewRecoveryMiddleware(),
		loggerMiddleware:   NewRequestLoggerMiddleware(),
		router:             mux.NewRouter(),
		baseCtx:            NewWebContext(),
	}
	for _, opt := range options {
		err := opt(server)
		if err != nil {
			return nil, errors.Wrap(err, "restapi.NewWebServer %T", opt)
		}
	}
	return server, nil
}

func (w *WebServer) Route(endpoint string, route RouteHandler, methods ...string) {
	if len(methods) == 0 {
		methods = []string{"GET"}
	}
	w.router.HandleFunc(endpoint, func(writer http.ResponseWriter, r *http.Request) {
		ctx := w.baseCtx.PrepareRequest(writer, r)
		routeHandler := func(ctx *WebContext) {
			route(ctx)
		}
		w.prepareRoute(ctx, routeHandler, w.middlewares...)()
		if err := ctx.Commit(); err != nil {
			panic(errors.Wrap(err, "WebServer#Route Commit"))
		}

	}).Methods(methods...)
}

// prepareRoute will create the call sequence for a specific route, calling all middlewares recursivelly until the route is called
func (w *WebServer) prepareRoute(ctx *WebContext, route RouteHandler, mds ...Middleware) func() {
	if len(mds) == 0 {
		return func() {
			route(ctx)
		}
	}
	return func() {
		// Call Middleware, passing the next callable (either the route or another middleware)
		mds[0](ctx, w.prepareRoute(ctx, route, mds[1:]...))
	}
}

// AddMiddlewares adds layers of handler functions that intercept both request and response.
// Note that the ordering matters here, so the first argument is going to be called first
// Important Note: NewRequestLoggerMiddleware and NewRecoveryMiddleware
// are set separatedly and always at start and the end, respectively.
func (w *WebServer) AddMiddlewares(middlewares ...Middleware) {
	w.middlewares = append(w.middlewares, middlewares...)
}

func (w *WebServer) Setup() {
	// Set the logging and recovery middlewares in the first and last position, respectively.
	extendedMiddlewares := make([]Middleware, len(w.middlewares)+2)
	extendedMiddlewares[0] = w.loggerMiddleware
	for i, m := range w.middlewares {
		extendedMiddlewares[i+1] = m
	}
	extendedMiddlewares[len(extendedMiddlewares)-1] = w.recoveryMiddleware
	w.middlewares = extendedMiddlewares
	var handler http.Handler = w.router
	w.server = &http.Server{
		Handler: handler,
	}
}

func (w *WebServer) Run(addr string) error {
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
	w.baseCtx.AddValue(key, value)
}
