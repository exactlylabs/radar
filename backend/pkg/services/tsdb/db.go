package tsdb

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

var db *sql.DB

func DB(dsn string) *sql.DB {
	var err error
	if db == nil {
		db, err = sql.Open("postgres", dsn)
		if err != nil {
			panic(fmt.Errorf("unable to connect to db: %w", err))
		}
	}
	return db
}
