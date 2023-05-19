package geoprovider

import (
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/paulmach/orb/geojson"
)

type geoJSONServer struct {
	namespace    namespaces.Namespace
	geojson      *GeoJSON
	geoJSONFiles map[namespaces.Namespace]string
}

func NewGeoJSONServer(c *config.Config, ns namespaces.Namespace) geo.GeoJSONServer {
	return &geoJSONServer{
		namespace: ns,
		geoJSONFiles: map[namespaces.Namespace]string{
			namespaces.US_STATE:  c.StatesGeoJSONFile,
			namespaces.US_COUNTY: c.CountiesGeoJSONFile,
			namespaces.US_TTRACT: c.TribalTractsGeoJSONFile,
		},
	}
}

func (gs *geoJSONServer) Load() error {
	g, err := readGeoJSON(gs.geoJSONFiles[gs.namespace])
	if err != nil {
		return errors.Wrap(err, "geoJSONServer#Load readGeoJSON")
	}
	gs.geojson = g
	return nil
}

func (gs *geoJSONServer) Get() (geo.GeoJSON, error) {
	// We should return a copy of all elements to avoid concurrency
	g := &GeoJSON{}
	g.fc.BBox = gs.geojson.fc.BBox
	g.fc.ExtraMembers = gs.geojson.fc.ExtraMembers
	g.fc.Type = gs.geojson.fc.Type
	g.fc.Features = make([]*geojson.Feature, len(gs.geojson.fc.Features))
	for i := range g.fc.Features {
		g.fc.Features[i] = copyFeature(gs.geojson.fc.Features[i])
	}
	return g, nil
}
