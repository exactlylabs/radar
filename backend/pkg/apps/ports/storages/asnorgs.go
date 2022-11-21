package storages

import "errors"

var (
	ErrASNOrgNotFound = errors.New("asn_org not found")
)

type ASNOrg struct {
	Id           string `json:"id"`
	Organization string `json:"organization"`
}

type Iterator[T any] interface {
	HasNext() bool
	GetRow() (T, error)
	Count() (uint64, error)
}

type ASNOrgStorage interface {
	Open() error
	Close() error
	Create(a *ASNOrg) error
	// Get returns an ASNOrg by Id or returns ErrASNOrgNotFound if not found
	Get(id string) (*ASNOrg, error)
	// GetByOrgName tries to find a single match for a given name. returns ErrASNOrgNotFound if not found
	GetByOrgName(name string) (*ASNOrg, error)
	All(limit, offset *int) (Iterator[*ASNOrg], error)
	AllFromGeospace(geospaceId string, limit, offset *int) (Iterator[*ASNOrg], error)
	Search(query string, limit, offset *int) (Iterator[*ASNOrg], error)
	SearchFromGeospace(query, geospaceId string, limit, offset *int) (Iterator[*ASNOrg], error)
}
