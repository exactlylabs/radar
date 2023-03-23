package routes

import (
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/docs"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/public"
)

func HandleSwaggerSpec(c *webcontext.Context) {
	s := docs.SwaggerInfo
	s.Host = c.Request.Host
	c.Write([]byte(docs.SwaggerInfo.ReadDoc()))
}

func HandleSwaggerUI(c *webcontext.Context) {
	data, err := public.Public.ReadFile("swagger.html")
	if err != nil {
		panic(err)
	}
	c.Write(data)
	c.ResponseHeader().Set("Content-Type", "text/html; charset=utf-8")
}
