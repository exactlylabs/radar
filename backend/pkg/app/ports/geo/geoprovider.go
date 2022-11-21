package geo

import (
	"errors"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
)

var (
	ErrLayerNotFound  = errors.New("layer not found")
	ErrWrongNamespace = errors.New("wrong namespace")
	ErrEmptyTile      = errors.New("empty tile")
)

type Feature interface {
	GetProperties() map[string]any
	SetProperty(key string, value any) error
}

type GeoJSON interface {
	Marshal(gziped bool) ([]byte, error)
	FindFeatureByProperty(key string, value any) Feature
	GetFeatures() []Feature
}

// VectorTile has methods to work with a single Tile from a tileset.
// Each tile can have multiple layers. These layers' names should be of Namespace type
type VectorTile interface {
	// Layers that are present in this Tile
	Layers() []namespaces.Namespace
	// Marshal encodes the VectorTile, with gzip or not. if layers is given, it only encodes those, otherwise it encodes all layers
	// If layer doesn't exist, it must return ErrLayerNotFound
	Marshal(gziped bool, layers ...namespaces.Namespace) ([]byte, error)
	// GetFeatures for a specific layer. If layer doesn't exist, it must return ErrLayerNotFound
	GetFeatures(layer namespaces.Namespace) ([]Feature, error)
	// Range iterates through all layers and their features.
	// To stop the iteration, you must either return false or an error. In case of an error, it is going to be returned by Range
	Range(func(layer namespaces.Namespace, feature Feature) (bool, error)) error
}

// GeoJSONServer has memthods to work with a GeoJSON file
type GeoJSONServer interface {
	Load() error
	Get() (GeoJSON, error)
}

// TilesetServer has methods to work with a tileset file
type TilesetServer interface {
	Load() error
	// Get the tile from the tileset. If no tile is found, return ErrEmptyTile
	Get(x, y, z uint64) (VectorTile, error)
}

// GeoJSONServers has all servers that this app works with
type GeoJSONServers struct {
	States       GeoJSONServer
	Counties     GeoJSONServer
	TribalTracts GeoJSONServer
}

// Get the GeoJSONServer based on the namespace or return ErrWrongNamespace in case of no match
func (gs *GeoJSONServers) Get(namespace namespaces.Namespace) (server GeoJSONServer, err error) {
	switch namespace {
	case namespaces.US_STATE:
		server = gs.States
	case namespaces.US_COUNTY:
		server = gs.Counties
	case namespaces.US_TTRACT:
		server = gs.TribalTracts
	default:
		return nil, ErrWrongNamespace
	}
	return
}

func (gs *GeoJSONServers) LoadAll() error {
	if err := gs.States.Load(); err != nil {
		return err
	}
	if err := gs.Counties.Load(); err != nil {
		return err
	}
	if err := gs.TribalTracts.Load(); err != nil {
		return err
	}
	return nil
}

// TilesetServers has all servers that this app works with
type TilesetServers struct {
	// Single layer (US_STATE Namespace) TilesetServer
	States TilesetServer
	// Single layer (US_COUNTY Namespace) TilesetServer
	Counties TilesetServer
	// Single layer (US_TTRACT Namespace) TilesetServer
	TribalTracts TilesetServer
	// Multiple layers that appear based on the zoom level
	MultiLayered TilesetServer
}

// Get the TilesetServer based on the namespace or return ErrWrongNamespace in case of no match
func (gs *TilesetServers) Get(namespace namespaces.Namespace) (server TilesetServer, err error) {
	switch namespace {
	case namespaces.US_STATE:
		server = gs.States
	case namespaces.US_COUNTY:
		server = gs.Counties
	case namespaces.US_TTRACT:
		server = gs.TribalTracts
	case namespaces.MULTI_LAYERED:
		server = gs.MultiLayered
	default:
		return nil, ErrWrongNamespace
	}
	return
}

func (gs *TilesetServers) LoadAll() error {
	if err := gs.States.Load(); err != nil {
		return err
	}
	if err := gs.Counties.Load(); err != nil {
		return err
	}
	if err := gs.TribalTracts.Load(); err != nil {
		return err
	}
	if err := gs.MultiLayered.Load(); err != nil {
		return err
	}
	return nil
}
