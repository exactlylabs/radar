package web

import (
	"fmt"
	"net/http"

	"github.com/exactlylabs/radar/server/pkg/app/model"
)

func recordHandler(w http.ResponseWriter, r *http.Request) {
	fErr := r.ParseForm()
	if fErr != nil {
		panic("unable to parse http form")
	}

	if len(r.Form["clientId"]) != 1 || len(r.Form["measurementBlobId"]) != 1 || len(r.Form["measurementType"]) != 1 {
		w.WriteHeader(400)
		w.Write([]byte("must have one clientId, measurementBlobId, and measurementType form field"))
		return
	}

	clientId := r.Form["clientId"][0]
	measurementBlobId := r.Form["measurementBlobId"][0]
	measurementType := r.Form["measurementType"][0]

	tx := model.DB.Create(&model.Measurement{
		Type:     measurementType,
		BlobId:   measurementBlobId,
		ClientId: clientId,
	})
	if tx.Error != nil {
		panic(fmt.Errorf("failed to create measurement: %w", tx.Error))
	}

	w.WriteHeader(http.StatusAccepted)
}
