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
	if errs := storages.Connected(); errs != nil {
		response.Storages = "NOT OK"
		for _, err := range errs {
			log.Println(errors.W(err))
			sentry.NotifyErrorOnce(errors.W(err), nil)
		}
	}
	ctx.JSON(http.StatusOK, response)
}
