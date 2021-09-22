package web

import (
	"context"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/handlers"
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
	mux := http.NewServeMux()

	mux.HandleFunc("/blobs", blobUploadHandler)
	mux.HandleFunc("/blobs/", blobHandler)

	mux.HandleFunc("/register", registerHandler)
	mux.HandleFunc("/session", sessionHandler)
	mux.HandleFunc("/record", recordHandler)

	mux.HandleFunc("/healthcheck", healthcheckHandler)

	w.srv = &http.Server{
		Addr:    addr,
		Handler: handlers.LoggingHandler(os.Stdout, handlers.RecoveryHandler()(mux)),
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
