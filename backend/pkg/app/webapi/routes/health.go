package routes

import (
	"net/http"

	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
)

type HealthCheckResponse struct {
	Status string `json:"status"`
}

func HealthCheck(ctx *webcontext.Context) {
	ctx.JSON(http.StatusOK, HealthCheckResponse{"ok"})
}
