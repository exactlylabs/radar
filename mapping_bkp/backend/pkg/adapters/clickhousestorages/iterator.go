package clickhousestorages

import (
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

type iterator[T interface {
	*storages.ASNOrg | *storages.DetailedGeospace
}] struct {
	rows           driver.Rows
	count          *uint64
	cachedRow      T
	cachedRowError error

	// Note: As of golang 1.20, there's no way to do type assertion
	// This proposal seeks to add it: https://github.com/golang/go/issues/45380
	// without it, we need to give a scannRow function, even though we know the possible types
	scannRow func(scanner Scanner, extraFields ...any) (T, error)
}

func (i *iterator[T]) Count() (uint64, error) {
	if i.count == nil {
		// Move the sql pointer and get first row
		if i.HasNext() {
			i.cachedRow, i.cachedRowError = i.GetRow()
		} else {
			c := uint64(0)
			i.count = &c
		}
	}
	if i.cachedRowError != nil {
		return 0, i.cachedRowError
	}
	return *i.count, i.cachedRowError
}

func (i *iterator[T]) HasNext() bool {
	if i.cachedRow != nil || i.cachedRowError != nil {
		return true
	}
	return i.rows.Next()
}

func (i *iterator[T]) GetRow() (obj T, err error) {
	if i.cachedRow != nil || i.cachedRowError != nil {
		r := i.cachedRow
		err := i.cachedRowError
		i.cachedRow = nil
		i.cachedRowError = nil
		return r, err
	}
	var count uint64
	obj, err = i.scannRow(i.rows, &count)
	if err != nil {
		return nil, errors.Wrap(err, "iterator#GetRow scanner")
	}
	i.count = &count
	return obj, nil
}
