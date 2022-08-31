package psqldb

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func New(dsn string) *sql.DB {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		panic(fmt.Errorf("unable to connect to db: %w", err))
	}
	return db
}
