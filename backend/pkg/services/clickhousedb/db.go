package clickhousedb

import (
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
)

type ChStorageOptions struct {
	Username       string
	Password       string
	Host           string
	Port           int
	DBName         string
	MaxConnections int
}

func Open(opts ChStorageOptions) (driver.Conn, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Auth: clickhouse.Auth{
			Database: opts.DBName,
			Username: opts.Username,
			Password: opts.Password,
		},
		Addr:         []string{fmt.Sprintf("%s:%d", opts.Host, opts.Port)},
		MaxOpenConns: opts.MaxConnections,
		ReadTimeout:  time.Hour,
	})
	if err != nil {
		return nil, errors.Wrap(err, "clickhouseStorage#Open Open")
	}
	return conn, nil
}
