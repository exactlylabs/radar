package storages

import (
	"errors"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
)

var (
	ErrGeospaceNotFound = errors.New("geospace not found")
)

type Geospace struct {
	Id        string               `json:"id"`
	Name      *string              `json:"name"`
	Namespace namespaces.Namespace `json:"namespace"`
	GeoId     string               `json:"geo_id"`
	ParentId  *string              `json:"parent_id"`
	Centroid  [2]float64           `json:"centroid"`
}

type DetailedGeospace struct {
	Id        string               `json:"id"`
	GeoId     string               `json:"geo_id"`
	Namespace namespaces.Namespace `json:"namespace"`
	Name      *string              `json:"name"`
	Parent    *Geospace            `json:"parent"`
	Centroid  [2]float64           `json:"centroid"`
}

func (dg *DetailedGeospace) AsGeospace() *Geospace {
	g := &Geospace{
		Id:        dg.Id,
		Name:      dg.Name,
		Namespace: dg.Namespace,
		GeoId:     dg.GeoId,
		Centroid:  dg.Centroid,
	}
	if dg.Parent != nil {
		g.ParentId = &dg.Parent.Id
	}
	return g
}

// Methods to work with geospaces
type GeospaceStorage interface {
	Open() error
	Close() error
	Connected() error
	Create(g *Geospace) error
	Update(g *Geospace) error
	// Get a geospace by its ID. If not found, ErrGeospaceNotFound is returned
	Get(id string) (*DetailedGeospace, error)
	// Get a geospace by its Geographic ID and Namespace. If not found, ErrGeospaceNotFound is returned
	GetByGeoId(namespace namespaces.Namespace, geoId string) (*DetailedGeospace, error)
	All(limit, offset *int) (Iterator[*DetailedGeospace], error)
	AllFromNamespace(namespace namespaces.Namespace, limit, offset *int) (Iterator[*DetailedGeospace], error)
	Search(query string, limit, offset *int) (Iterator[*DetailedGeospace], error)
	SearchFromNamespace(query string, namespace namespaces.Namespace, limit, offset *int) (Iterator[*DetailedGeospace], error)
}
