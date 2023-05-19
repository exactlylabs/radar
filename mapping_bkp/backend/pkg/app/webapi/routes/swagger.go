package routes

import (
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/public"
	"github.com/swaggo/swag"
)

func HandleSwaggerSpec(c *webcontext.Context) {
	s := swag.GetSwagger("swagger").(*swag.Spec)
	s.Host = c.Request.Host
	c.Write([]byte(s.ReadDoc()))
}

func HandleSwaggerUI(c *webcontext.Context) {
	data, err := public.HTMLs.ReadFile("html/swagger.html")
	if err != nil {
		panic(err)
	}
	c.Write(data)
	c.ResponseHeader().Set("Content-Type", "text/html; charset=utf-8")
}
