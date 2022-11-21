package routes

import (
	"net/http"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi"
)

type HealthCheckResponse struct {
	Status string `json:"status"`
}

func HealthCheck(ctx *restapi.WebContext) {
	ctx.JSON(http.StatusOK, HealthCheckResponse{"ok"})
}
