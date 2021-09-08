package web

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"log"

	"github.com/exactlylabs/radar/server/pkg/services/blob"
)

type uploadResponse struct {
	Id string `json:"id"`
}

func blobUploadHandler(w http.ResponseWriter, r *http.Request) {
	errMulti := r.ParseMultipartForm(32 << 20) // Place up to 32MB of form into memory
	if errMulti != nil {
		// TODO: Better logging of errors in web request setting
		log.Println(errMulti)
		http.Error(w, errMulti.Error(), http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		panic(fmt.Errorf("error retrieving file: %w", err))
	}
	defer file.Close()

	blobId, uploadErr := blob.EnvStorer().Upload(handler.Filename, handler.Header.Get("content-type"), file)
	if uploadErr != nil {
		log.Println(uploadErr)
		http.Error(w, uploadErr.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	encodeErr := json.NewEncoder(w).Encode(uploadResponse{Id: blobId})
	if encodeErr != nil {
		log.Println(encodeErr)
	}
}

func blobHandler(w http.ResponseWriter, r *http.Request) {
	urlParts := strings.Split(r.URL.Path, "/")
	if len(urlParts) != 3 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	blobId := urlParts[2]
	file, contentType, err := blob.EnvStorer().Fetch(blobId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", "attachment; filename="+blobId)

	io.Copy(w, file)
}
