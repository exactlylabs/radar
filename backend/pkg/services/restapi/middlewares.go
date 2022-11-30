package restapi

import (
	"log"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi/apierrors"
	"github.com/gorilla/mux"
)

type Middleware mux.MiddlewareFunc

// Request Logging Middleware

type loggingMiddleware struct {
	handler http.Handler
}

func (lm *loggingMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	t := time.Now()
	lm.handler.ServeHTTP(w, r)
	log.Printf("%v - %s - %v\n", r.Method, r.URL, time.Since(t))
}

func RequestLoggerMiddleware(handler http.Handler) http.Handler {
	return &loggingMiddleware{handler}
}

// Panic Recovery Middleware

type recoveryMiddleware struct {
	handler http.Handler
}

func (rm *recoveryMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			ctx := NewWebContext()
			ctx = ctx.PrepareRequest(w, r)
			ctx.Reject(http.StatusInternalServerError, &apierrors.InternalAPIError)

			log.Println(err)
			stack := string(debug.Stack())
			log.Println(stack)
		}
	}()
	rm.handler.ServeHTTP(w, r)
}

func RecoveryMiddleware(handler http.Handler) http.Handler {
	return &recoveryMiddleware{handler}
}
