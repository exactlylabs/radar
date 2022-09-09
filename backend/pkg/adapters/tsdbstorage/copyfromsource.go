package tsdbstorage

import (
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
)

type copyStruct struct {
	ts     *TimescaleDBStorage
	it     ports.MeasurementIterator
	values []interface{}
	err    error
}

func (c *copyStruct) Next() bool {
	m, err := c.it.Next()
	if err != nil {
		c.err = errors.Wrap(err, "copyStruct#Next Next")
		return false
	}
	if m == nil {
		return false
	}
	geoId, err := c.ts.getOrCreateGeospace(&ports.Geospace{Namespace: m.GeoNamespace, GeoId: m.GeoId})
	if err != nil {
		c.err = errors.Wrap(err, "TimescaleDBStorage#InsertMeasurements getOrCreateGeospace")
		return false
	}
	asnId, err := c.ts.getOrCreateASN(m.ASN, m.ASNOrg)
	if err != nil {
		c.err = errors.Wrap(err, "TimescaleDBStorage#InsertMeasurements getOrCreateASN")
		return false
	}
	c.values = []interface{}{
		m.Id, m.TestStyle, m.IP, time.Unix(m.StartedAt, 0), m.Upload, m.MBPS,
		m.LossRate, m.MinRTT, m.Latitude, m.Longitude,
		m.LocationAccuracyKM, asnId, m.HasAccessToken,
		m.AccessTokenSig, geoId,
	}
	return true
}

func (c *copyStruct) Values() ([]interface{}, error) {
	return c.values, nil
}

func (c *copyStruct) Err() error {
	return c.err
}
