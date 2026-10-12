package routes

import (
	"log"
	"net/http"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

type HealthCheckResponse struct {
	Status   string `json:"status"`
	Storages string `json:"storages"`
}

func HealthCheck(ctx *webcontext.Context, storages *storages.MappingAppStorages) {
	response := HealthCheckResponse{
		Status:   "OK",
		Storages: "OK",
	}
	// Connected returns one entry per storage, nil when that storage is fine.
	for _, err := range storages.Connected() {
		if err == nil {
			continue
		}
		response.Storages = "NOT OK"
		log.Println(errors.W(err))
		sentry.NotifyErrorOnce(errors.W(err), nil)
	}
	ctx.JSON(http.StatusOK, response)
}
