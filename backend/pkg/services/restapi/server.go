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
	setupCalled        bool
}

func NewWebServer(options ...ServerOption) (*WebServer, error) {
	server := &WebServer{
		middlewares:        make([]Middleware, 0),
		recoveryMiddleware: RecoveryMiddleware,
		loggerMiddleware:   RequestLoggerMiddleware,
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
		route(ctx)
		if err := ctx.Commit(); err != nil {
			panic(errors.Wrap(err, "WebServer#Route Commit"))
		}
	}).Methods(methods...)
}

// AddMiddlewares adds layers of handler functions to an existing route.
// Note that the ordering matters here, so the first argument is going to be called first
// Important Note: NewRequestLoggerMiddleware and NewRecoveryMiddleware
// are set separatedly, and always at start.
func (w *WebServer) AddMiddlewares(middlewares ...Middleware) {
	w.middlewares = append(w.middlewares, middlewares...)
}

func (w *WebServer) Setup() {
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
		w.Setup()
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
	w.baseCtx.AddValue(key, value)
}
