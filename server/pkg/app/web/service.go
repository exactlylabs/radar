package web

import (
	"context"
	"log"
	"net/http"
	"sync"
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
	w.srv = &http.Server{Addr: addr}

	http.HandleFunc("/blobs", blobUploadHandler)
	http.HandleFunc("/blobs/", blobHandler)

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
