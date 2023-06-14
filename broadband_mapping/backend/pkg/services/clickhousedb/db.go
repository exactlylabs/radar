package clickhousedb

import (
	"crypto/tls"
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
	SecureTLS      bool
}

func Open(opts ChStorageOptions) (driver.Conn, error) {
	chOpts := &clickhouse.Options{
		Auth: clickhouse.Auth{
			Database: opts.DBName,
			Username: opts.Username,
			Password: opts.Password,
		},
		Addr:         []string{fmt.Sprintf("%s:%d", opts.Host, opts.Port)},
		MaxOpenConns: opts.MaxConnections,
		ReadTimeout:  time.Hour,
	}
	if opts.SecureTLS {
		chOpts.TLS = &tls.Config{}
	}
	conn, err := clickhouse.Open(chOpts)

	if err != nil {
		return nil, errors.Wrap(err, "clickhouseStorage#Open Open")
	}
	return conn, nil
}
