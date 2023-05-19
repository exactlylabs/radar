package geoprovider

import (
	"bytes"
	"compress/gzip"
	"io/ioutil"
	"os"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/paulmach/orb/geojson"
)

type GeoJSON struct {
	fc geojson.FeatureCollection
}

func (gj *GeoJSON) Marshal(gziped bool) ([]byte, error) {
	encoded, err := gj.fc.MarshalJSON()
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
	for _, f := range gj.fc.Features {
		if v, exists := f.Properties[key]; exists && v == value {
			return &Feature{f}
		}
	}
	return nil
}

func (gj *GeoJSON) GetFeatures() []geo.Feature {
	// since it's a slice, we need to "cast" each element
	features := make([]geo.Feature, len(gj.fc.Features))
	for i := range gj.fc.Features {
		features[i] = &Feature{gj.fc.Features[i]}
	}
	return features
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
	return &GeoJSON{fc: *fc}, nil
}

func copyFeature(f *geojson.Feature) *geojson.Feature {
	newF := geojson.NewFeature(f.Geometry)
	newF.BBox = f.BBox
	newF.Properties = f.Properties.Clone()
	return newF
}
