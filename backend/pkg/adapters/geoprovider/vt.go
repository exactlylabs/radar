package geoprovider

import (
	"database/sql"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/paulmach/orb/encoding/mvt"
	mbtiles "github.com/twpayne/go-mbtiles"
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

type tilesetServer struct {
	namespace namespaces.Namespace
	reader    *mbtiles.Reader
	// Maps each Namespace to it's associated mbtiles file
	tilesetFiles map[namespaces.Namespace]string
	// Maps the layers in the .mbtile files to the system's Namespaces
	layersMap map[string]namespaces.Namespace
}

func NewTilesetServer(c *config.Config, ns namespaces.Namespace) geo.TilesetServer {
	return &tilesetServer{
		namespace: ns,
		tilesetFiles: map[namespaces.Namespace]string{
			namespaces.US_STATE:      c.StatesMBTilesFile,
			namespaces.US_COUNTY:     c.CountiesMBTilesFile,
			namespaces.US_TTRACT:     c.TribalTractsMBTilesFile,
			namespaces.MULTI_LAYERED: c.MultiLayeredMBTilesFile,
		},
		layersMap: map[string]namespaces.Namespace{
			c.StatesLayerName:       namespaces.US_STATE,
			c.CountiesLayerName:     namespaces.US_COUNTY,
			c.TribalTractsLayerName: namespaces.US_TTRACT,
		},
	}
}

func (ts *tilesetServer) Load() error {
	reader, err := mbtiles.NewReader(ts.tilesetFiles[ts.namespace])
	if err != nil {
		return errors.Wrap(err, "tilesetServer#Load NewReader")
	}
	ts.reader = reader
	return nil
}

func (ts *tilesetServer) Get(x, y, z uint64) (geo.VectorTile, error) {
	tile, err := ts.reader.SelectTile(int(z), int(x), int(y))
	if err == sql.ErrNoRows {
		return nil, geo.ErrEmptyTile
	} else if err != nil {
		return nil, errors.Wrap(err, "tilesetServer#Get SelectTile")
	}
	mvtLayers, err := mvt.UnmarshalGzipped(tile)
	if err != nil {
		return nil, errors.Wrap(err, "tilesetServer#Get UnmarshalGzipped")
	}
	vt := &vectorTile{
		originalTile: tile,
		layers:       make(map[namespaces.Namespace]layer),
	}
	for i := range mvtLayers {
		mvtFeatures := mvtLayers[i].Features
		features := make([]*Feature, len(mvtFeatures))
		for j := range mvtFeatures {
			features[j] = &Feature{mvtFeatures[j]}
		}
		layerNamespace, exists := ts.layersMap[mvtLayers[i].Name]
		if !exists {
			return nil, errors.New("tilesetServer#Get unsupported layer name %s", mvtLayers[i].Name)
		}
		vt.layers[layerNamespace] = layer{
			Layer:    mvtLayers[i],
			features: features,
		}
	}
	return vt, nil
}
