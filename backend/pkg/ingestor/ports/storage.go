package ports

import (
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/models"
)

type Namespace string

type MeasurementIterator interface {
	Next() (*models.Measurements, error)
}

type RevGeocodeIterator interface {
	Next() (*models.RevGeoResult, error)
}

type Geospace struct {
	Id        string  `json:"id"`
	Name      *string `json:"name"`
	Namespace string  `json:"namespace"`
	GeoId     string  `json:"geo_id"`
	ParentId  *string `json:"parent_id"`
}

type MeasurementsStorage interface {
	// Begin the storage before starting running insertions
	Begin() error
	InsertMeasurements(it MeasurementIterator) error
	LastMeasurementDate() (*time.Time, error)
	SaveGeospace(g *Geospace) error
	GetGeospaceByGeoId(namespace, geoId string) (*Geospace, error)
	// Close gracefully finishes all insertions as well as updating any possible snapshot
	Close() error
}
