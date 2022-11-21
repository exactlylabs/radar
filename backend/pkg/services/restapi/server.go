package restapi

import (
	"context"
	"log"
	"net/http"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/gorilla/mux"
)

type WebServer struct {
	server           *http.Server
	handlerProviders []func(http.Handler) http.Handler
	router           *mux.Router
	baseCtx          *WebContext
}

func NewWebServer() *WebServer {
	return &WebServer{
		handlerProviders: make([]func(http.Handler) http.Handler, 0),
		router:           mux.NewRouter(),
		baseCtx:          NewWebContext(),
	}
}
func (w *WebServer) Route(endpoint string, route func(*WebContext), methods ...string) {
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

// AddHandlers adds layers of handler functions before calling the route.
// Note that the ordering matters here, so the first argument is going to be called first
func (w *WebServer) AddHandlers(provider ...func(h http.Handler) http.Handler) {
	w.handlerProviders = append(w.handlerProviders, provider...)
}

func (w *WebServer) Setup() {
	handler := newRequestLogger()(recoveryHandler()(w.router))
	for i := len(w.handlerProviders) - 1; i >= 0; i-- {
		handler = w.handlerProviders[i](handler)
	}
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
