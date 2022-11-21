package clickhousestorages

import (
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
)

type geospaceIterator struct {
	rows           driver.Rows
	count          *uint64
	cachedRow      *storages.DetailedGeospace
	cachedRowError error
}

func (gi *geospaceIterator) Count() (uint64, error) {
	if gi.count == nil {
		gi.count = new(uint64)
		// Move the sql pointer and get first row
		if gi.HasNext() {
			gi.cachedRow, gi.cachedRowError = gi.GetRow()
		} else {
			c := uint64(0)
			gi.count = &c
		}
	}
	return *gi.count, gi.cachedRowError
}

func (gi *geospaceIterator) HasNext() bool {
	if gi.cachedRow != nil || gi.cachedRowError != nil {
		return true
	}
	return gi.rows.Next()
}

func (gi *geospaceIterator) GetRow() (*storages.DetailedGeospace, error) {
	if gi.cachedRow != nil || gi.cachedRowError != nil {
		r := gi.cachedRow
		err := gi.cachedRowError
		gi.cachedRow = nil
		gi.cachedRowError = nil
		return r, err
	}
	g := &storages.DetailedGeospace{}
	var count uint64
	g, err := scanDetailedGeospace(gi.rows, &count)
	if err != nil {
		return nil, errors.Wrap(err, "geospaceIterator#GetRow scanDetailedGeospace")
	}
	gi.count = &count
	return g, nil
}
