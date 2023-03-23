package webapi

import (
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-rest/pkg/restapi"
	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	ports "github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/routes"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
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

	// simply inject the object given to it when the provider is called
	injector := func(obj any) restapi.DependencyProvider {
		return func(c *webcontext.Context) any {
			return obj
		}
	}

	api.Route("/health", routes.HealthCheck)
	api.Route("/api/v1/namespaces/{namespace}/tiles/{z}/{x}/{y}", routes.ServeVectorTiles)
	api.Route("/api/v1/geospaces", routes.ListAllGeospaces)
	api.Route("/api/v1/geospaces/{id}/overview", routes.GeospaceMeasurementsOverviewHandler)
	api.Route("/api/v1/geospaces/{id}/asns", routes.GeospaceASNs)
	api.Route("/api/v1/asns", routes.ListASNs)
	api.Route("/api/v1/namespaces/{namespace}/geospaces", routes.ListNamespaceGeospaces)
	api.Route("/api/v1/geojson", routes.HandleGetGeoJSON)
	api.Route("/swagger.json", routes.HandleSwaggerSpec)
	api.Route("/swagger", routes.HandleSwaggerUI)
	api.AddDependency(injector(storages.SummariesStorage), storages.SummariesStorage)
	api.AddDependency(injector(storages.ASNOrgsStorage), storages.ASNOrgsStorage)
	api.AddDependency(injector(storages.GeospacesStorage), storages.GeospacesStorage)
	api.AddDependency(injector(conf), conf)
	api.AddDependency(injector(geoJSONServers), geoJSONServers)
	api.AddDependency(injector(tilesetServers), tilesetServers)

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
