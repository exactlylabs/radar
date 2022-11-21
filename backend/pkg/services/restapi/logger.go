package restapi

import (
	"log"
	"net/http"
	"time"
)

type requestLogger struct {
	handler http.Handler
}

func newRequestLogger() func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return &requestLogger{h}
	}
}

func (lm *requestLogger) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	t := time.Now()
	lm.handler.ServeHTTP(w, r)
	log.Printf("%v - %s - %v\n", r.Method, r.URL, time.Since(t))
}
