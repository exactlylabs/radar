package clickhousestorages

import (
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
)

type asnIterator struct {
	rows           driver.Rows
	count          *uint64
	cachedRow      *storages.ASNOrg
	cachedRowError error
}

func (ai *asnIterator) Count() (uint64, error) {
	if ai.count == nil {
		// Move the sql pointer and get first row
		if ai.HasNext() {
			ai.cachedRow, ai.cachedRowError = ai.GetRow()
		} else {
			c := uint64(0)
			ai.count = &c
		}
	}
	if ai.cachedRowError != nil {
		return 0, ai.cachedRowError
	}
	return *ai.count, ai.cachedRowError
}

func (ai *asnIterator) HasNext() bool {
	if ai.cachedRow != nil || ai.cachedRowError != nil {
		return true
	}
	return ai.rows.Next()
}

func (ai *asnIterator) GetRow() (*storages.ASNOrg, error) {
	if ai.cachedRow != nil || ai.cachedRowError != nil {
		r := ai.cachedRow
		err := ai.cachedRowError
		ai.cachedRow = nil
		ai.cachedRowError = nil
		return r, err
	}
	var count uint64
	a, err := scanASNOrg(ai.rows, &count)
	if err != nil {
		return nil, errors.Wrap(err, "asnIterator#GetRow scanASNOrg")
	}
	ai.count = &count
	return a, nil
}
