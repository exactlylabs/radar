package geoprovider

import (
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/paulmach/orb/encoding/mvt"
	"golang.org/x/exp/slices"
)

type layer struct {
	*mvt.Layer
	features []*Feature
}

type vectorTile struct {
	originalTile []byte
	layers       map[namespaces.Namespace]layer
}

// GetFeatures implements ports.VectorTile
func (vt *vectorTile) GetFeatures(layer namespaces.Namespace) ([]geo.Feature, error) {
	features := make([]geo.Feature, 0)
	for _, layer := range vt.layers {
		for _, feature := range layer.Features {
			features = append(features, &Feature{feature})
		}
	}
	return features, nil
}

func (vt *vectorTile) Layers() []namespaces.Namespace {
	layers := make([]namespaces.Namespace, len(vt.layers))
	i := 0
	for k := range vt.layers {
		layers[i] = k
		i++
	}
	return layers
}

// Marshal implements ports.VectorTile
func (vt *vectorTile) Marshal(gziped bool, layers ...namespaces.Namespace) (data []byte, err error) {
	allowedLayers := make(mvt.Layers, 0)
	for ns, layer := range vt.layers {
		if len(layers) == 0 || slices.Contains(layers, ns) {
			allowedLayers = append(allowedLayers, layer.Layer)
		}
	}
	if gziped {
		data, err = mvt.MarshalGzipped(allowedLayers)
	} else {
		data, err = mvt.Marshal(allowedLayers)
	}
	if err != nil {
		return nil, errors.Wrap(err, "ProjectedTile2#Marshal Marshal")
	}
	return
}

func (vt *vectorTile) Range(callback func(layer namespaces.Namespace, feature geo.Feature) (bool, error)) error {
	for namespace, layer := range vt.layers {
		for _, feature := range layer.features {
			cont, err := callback(namespace, feature)
			if err != nil {
				return err
			}
			if !cont {
				return nil
			}
		}
	}
	return nil
}
