package routes

import (
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/docs"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/public"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi"
)

func HandleSwaggerSpec(c *restapi.WebContext) {
	s := docs.SwaggerInfo
	s.Host = c.Request.Host
	c.Write([]byte(docs.SwaggerInfo.ReadDoc()))
}

func HandleSwaggerUI(c *restapi.WebContext) {
	data, err := public.Public.ReadFile("swagger.html")
	if err != nil {
		panic(err)
	}
	c.Write(data)
	c.ResponseHeader().Set("Content-Type", "text/html; charset=utf-8")
}
