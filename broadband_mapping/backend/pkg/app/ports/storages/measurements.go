package storages

import (
	"time"
)

// Measurement is one M-Lab test, stored as one row of the tests table.
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
	ASNId              string
	// Geospace ids of the test per namespace, "" when it has none. A test in more than one
	// geospace of a namespace (two counties, a tribal tract and an AIANNH area) has the others
	// in ExtraGeospaceIds.
	StateId          string
	CountyId         string
	TribalId         string
	ExtraGeospaceIds []string
	HasAccessToken   bool
	AccessTokenSig   *string
}

type MeasurementIterator interface {
	Next() (*Measurement, error)
}

type MeasurementStorage interface {
	Open() error
	// Close waits for the pending inserts and returns the first insert error.
	Close() error
	Connected() error
	Insert(it MeasurementIterator) error
	// LastDate is the time of the newest test, nil when there is none.
	LastDate() (*time.Time, error)
	// Inserted is the number of tests inserted since the storage was created.
	Inserted() uint64
	// IDsOn returns the ids of the tests of a UTC day.
	IDsOn(day time.Time) (map[string]struct{}, error)
	// StartReplace starts replacing every test of days, which must be in one month: until
	// CommitReplace, inserts go to a copy of the month without those days. Call it closed.
	StartReplace(days []time.Time) error
	// CommitReplace puts the copy in place of the month. Call it after Close.
	CommitReplace() error
	// IngestedManifest is the finished_at of the completeness manifest recorded for a UTC
	// day by RecordManifest, and whether one was recorded.
	IngestedManifest(day time.Time) (time.Time, bool, error)
	RecordManifest(day time.Time, finishedAt time.Time) error
}
