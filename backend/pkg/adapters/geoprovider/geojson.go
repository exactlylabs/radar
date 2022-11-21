package geoprovider

import (
	"bytes"
	"compress/gzip"
	"io/ioutil"
	"os"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/paulmach/orb/geojson"
)

type GeoJSON struct {
	geojson.FeatureCollection
}

func (gj *GeoJSON) Marshal(gziped bool) ([]byte, error) {
	encoded, err := gj.MarshalJSON()
	if err != nil {
		return nil, errors.Wrap(err, "GeoJSON#Marshal MarshalJSON")
	}
	if gziped {
		b := bytes.NewBuffer(nil)
		w := gzip.NewWriter(b)
		if _, err = w.Write(encoded); err != nil {
			return nil, errors.Wrap(err, "GeoJSON#Marshal Write")
		}
		w.Close()
		return b.Bytes(), nil
	}
	return encoded, nil
}

func (gj *GeoJSON) FindFeatureByProperty(key string, value any) geo.Feature {
	for _, f := range gj.Features {
		if v, exists := f.Properties[key]; exists && v == value {
			return &Feature{f}
		}
	}
	return nil
}

func (gj *GeoJSON) GetFeatures() []geo.Feature {
	// since it's a slice, we need to "cast" each element
	features := make([]geo.Feature, len(gj.Features))
	for i := range gj.Features {
		features[i] = &Feature{gj.Features[i]}
	}
	return features
}

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
	g.BBox = gs.geojson.BBox
	g.ExtraMembers = gs.geojson.ExtraMembers
	g.Type = gs.geojson.Type
	g.Features = make([]*geojson.Feature, len(gs.geojson.Features))
	for i := range g.Features {
		g.Features[i] = copyFeature(gs.geojson.Features[i])
	}
	return g, nil
}

func readGeoJSON(path string) (*GeoJSON, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, errors.Wrap(err, "geo#readGeoJSON Open")
	}
	defer f.Close()
	data, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, errors.Wrap(err, "geo#readGeoJSON ReadAll")
	}
	fc, err := geojson.UnmarshalFeatureCollection(data)
	if err != nil {
		return nil, errors.Wrap(err, "geo#readGeoJSON UnmarshalJSON")
	}
	return &GeoJSON{FeatureCollection: *fc}, nil
}

func copyFeature(f *geojson.Feature) *geojson.Feature {
	newF := geojson.NewFeature(f.Geometry)
	newF.BBox = f.BBox
	newF.Properties = f.Properties.Clone()
	return newF
}
