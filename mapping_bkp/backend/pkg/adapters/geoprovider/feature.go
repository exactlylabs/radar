package geoprovider

import "github.com/paulmach/orb/geojson"

type Feature struct {
	*geojson.Feature
}

func (f *Feature) GetProperties() map[string]any {
	return f.Properties
}

func (f *Feature) SetProperty(key string, value any) error {
	f.Properties[key] = value
	return nil
}
