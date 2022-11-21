package restapi

import (
	"log"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/apierrors"
	"github.com/gorilla/mux"
)

// Middleware is called each request.
// The provided context is unique in the request lifecycle,
// so any changes here are going to be reflected to the downstream middlewares and finally the route handler.
// This function **must** call next() callback.
// If you wish to run anything in the request, just run it before calling next().
// If you wish to run anythin in the response, just run it after calling next().
type Middleware func(ctx *WebContext, next func())

// Request Logging Middleware

func NewRequestLoggerMiddleware() Middleware {
	return func(ctx *WebContext, next func()) {
		t := time.Now()
		next()
		log.Printf("%v - %s - %v\n", ctx.Request.Method, ctx.Request.URL, time.Since(t))
	}
}

// Panic Recovery Middleware

func NewRecoveryMiddleware() Middleware {
	return func(ctx *WebContext, next func()) {
		defer func() {
			if err := recover(); err != nil {
				ctx.Reject(http.StatusInternalServerError, &apierrors.InternalAPIError)
				log.Println(err)
				stack := string(debug.Stack())
				log.Println(stack)
			}
		}()
		next()
	}
}

// WrapMuxMiddlewareFunc converts Mux middlewares into ours
func WrapMuxMiddlewareFunc(m mux.MiddlewareFunc) Middleware {
	return func(ctx *WebContext, next func()) {
		mw := &muxWrapper{next: next}
		handler := m(mw)
		handler.ServeHTTP(ctx.Writer, ctx.Request)
	}
}

type muxWrapper struct {
	next func()
}

// ServeHTTP is going to be called by the Mux Middleware
func (mw *muxWrapper) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	mw.next()
}
