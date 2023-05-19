package clickhousestorages

import (
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

func NewIngestorAppStorages(db driver.Conn, nWorkers int, truncate bool) storages.IngestorAppStorages {
	return storages.IngestorAppStorages{
		GeospaceStorage: NewGeospaceStorage(db),
		ASNOrgStorage:   NewASNOrgStorage(db),
		MeasurementStorage: NewMeasurementStorage(db, &MeasurementStorageOpts{
			NWorkers: nWorkers,
			Truncate: truncate,
		}),
		SummariesStorage: NewSummariesStorage(db),
	}
}
