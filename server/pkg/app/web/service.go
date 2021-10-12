package web

import (
	"context"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type WebService struct {
	srv        *http.Server
	shutdownWg *sync.WaitGroup
}

func NewWebService() *WebService {
	return &WebService{
		shutdownWg: &sync.WaitGroup{},
	}
}

func (w *WebService) Run(addr string) {
	mux := mux.NewRouter()

	mux.HandleFunc("/blobs", blobUploadHandler).Methods("PUT")
	mux.HandleFunc("/blobs/", blobHandler).Methods("GET")

	mux.HandleFunc("/register", registerHandler).Methods("POST")
	mux.HandleFunc("/session", sessionHandler).Methods("POST")
	mux.HandleFunc("/record", recordHandler).Methods("POST")

	mux.HandleFunc("/beacons", ListBeaconsHandler).Methods("GET")
	mux.HandleFunc("/beacons/{beaconId}/add", AddBeconHandler).Methods("POST")
	mux.HandleFunc("/beacons/{beaconId}", UpdateBeaconHandler).Methods("PUT")

	mux.HandleFunc("/signup", signupHandler).Methods("POST")
	mux.HandleFunc("/login", loginHandler).Methods("POST")

	mux.HandleFunc("/healthcheck", healthcheckHandler)

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Authorization"})
	originsOk := handlers.AllowedOrigins([]string{"http://localhost:8080"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	w.srv = &http.Server{
		Addr:    addr,
		Handler: handlers.CORS(originsOk, headersOk, methodsOk)(handlers.LoggingHandler(os.Stdout, handlers.RecoveryHandler()(mux))),
	}

	w.shutdownWg.Add(1)
	go func() {
		defer w.shutdownWg.Done()

		if err := w.srv.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe(): %v", err)
		}
	}()
}

func (w *WebService) Shutdown() {
	if err := w.srv.Shutdown(context.TODO()); err != nil {
		panic(err)
	}
}
