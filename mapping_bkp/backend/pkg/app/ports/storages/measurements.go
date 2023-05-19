package storages

import (
	"time"
)

type Measurement struct {
	Id                 string
	TestStyle          string
	IP                 string
	StartedAt          int64
	Upload             bool
	MBPS               float32
	LossRate           *float32
	MinRTT             *float32
	Latitude           float64
	Longitude          float64
	LocationAccuracyKM float64
	GeospaceId         string
	ASNId              string
	HasAccessToken     bool
	AccessTokenSig     *string
}

type MeasurementIterator interface {
	Next() (*Measurement, error)
}

type MeasurementStorage interface {
	Open() error
	Close() error
	Connected() error
	Insert(it MeasurementIterator) error
	LastDate() (*time.Time, error)
}
