package clickhousestorages

import (
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/clickhousedb"
)

func addLimitOffset(query string, args []any, limit, offset *int) (string, []any) {
	if limit != nil {
		query += " LIMIT ?"
		args = append(args, *limit)
	}
	if offset != nil {
		query += " OFFSET ?"
		args = append(args, *offset)
	}
	return query, args
}

func DB(conf *config.Config, nWorkers int) driver.Conn {
	db, err := clickhousedb.Open(clickhousedb.ChStorageOptions{
		DBName:         conf.DBName,
		Username:       conf.DBUser,
		Password:       conf.DBPassword,
		Host:           conf.DBHost,
		Port:           conf.DBPort(),
		MaxConnections: nWorkers + 5,
	})
	if err != nil {
		panic(err)
	}
	return db
}
