package restapi

import (
	"encoding/json"
	"log"
	"net/http"
	"runtime/debug"
)

type recovery struct {
	handler http.Handler
}

func recoveryHandler() func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return &recovery{handler: h}
	}
}

func (h recovery) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			data, _ := json.Marshal(InternalAPIError)
			w.Write(data)
			log.Println(err)
			stack := string(debug.Stack())
			log.Println(stack)
		}
	}()

	h.handler.ServeHTTP(w, r)
}
