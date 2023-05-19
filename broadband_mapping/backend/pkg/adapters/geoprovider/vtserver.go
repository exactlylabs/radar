package geoprovider

import (
	"database/sql"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/paulmach/orb/encoding/mvt"
	mbtiles "github.com/twpayne/go-mbtiles"
)

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
			namespaces.US_STATE:  c.StatesMBTilesFile,
			namespaces.US_COUNTY: c.CountiesMBTilesFile,
			namespaces.US_TTRACT: c.TribalTractsMBTilesFile,
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
