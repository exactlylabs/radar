package webapi

import (
	ports "github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/routes"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/restapi"
	"github.com/gorilla/handlers"
)

//go:generate swag init -g webapi.go --parseDependency

// @title       Broadband Mapping API
// @version     0.1.0
// @description This api provides a summary of broadband measurements for the US based on geolocations (geospaces)

// @contact.name  Exactly Labs
// @contact.url   https://exactlylabs.com
// @contact.email devops@exactlylabs.com

// @host     api.mapping.exactlylabs.com
// @accept   json
// @produce  json
// @BasePath /api/v1
func NewMappingAPI(
	conf *config.Config,
	storages *storages.MappingAppStorages,
	geoJSONServers *ports.GeoJSONServers,
	tilesetServers *ports.TilesetServers,
) *restapi.WebServer {

	api, err := restapi.NewWebServer()
	if err != nil {
		panic(err)
	}
	api.AddMiddlewares(
		handlers.CORS(
			handlers.AllowedOrigins(conf.AllowedOrigins()),
		),
	)

	api.Route("/health", routes.HealthCheck)
	api.Route("/api/v1/tiles/{z}/{x}/{y}", routes.ServeMultiLayeredVectorTiles)
	api.Route("/api/v1/namespaces/{namespace}/tiles/{z}/{x}/{y}", routes.ServeVectorTiles)
	api.Route("/api/v1/geospaces", routes.ListAllGeospaces)
	api.Route("/api/v1/geospaces/{id}/overview", routes.GeospaceMeasurementsOverviewHandler)
	api.Route("/api/v1/geospaces/{id}/asns", routes.GeospaceASNs)
	api.Route("/api/v1/asns", routes.ListASNs)
	api.Route("/api/v1/namespaces/{namespace}/geospaces", routes.ListNamespaceGeospaces)
	api.Route("/api/v1/geojson", routes.HandleGetGeoJSON)
	api.Route("/swagger.json", routes.HandleSwaggerSpec)
	api.Route("/swagger", routes.HandleSwaggerUI)
	api.AddToContext("summariesStorage", storages.SummariesStorage)
	api.AddToContext("asnsStorage", storages.ASNOrgsStorage)
	api.AddToContext("geospacesStorage", storages.GeospacesStorage)
	api.AddToContext("config", conf)
	api.AddToContext("geoJSONServers", geoJSONServers)
	api.AddToContext("tilesetServers", tilesetServers)
	if err := geoJSONServers.LoadAll(); err != nil {
		panic(errors.Wrap(err, "webapi.NewMappingAPI geoJSONServers.LoadAll"))
	}
	if err := tilesetServers.LoadAll(); err != nil {
		panic(errors.Wrap(err, "webapi.NewMappingAPI tilesetServers.LoadAll"))
	}
	if err := storages.OpenAll(); err != nil {
		panic(errors.Wrap(err, "webapi.NewMappingAPI storages.OpenAll"))
	}
	return api
}
