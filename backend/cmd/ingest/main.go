package main

import (
	"context"
	"fmt"
	_ "net/http/pprof"
	"runtime"
	"strconv"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/tsdbstorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	conf := config.GetConfig()
	var storage ports.MeasurementsStorage
	if conf.StorageType == "tsdb" {
		nWorkers := runtime.NumCPU()
		if conf.TSDBStorageNWorkers != "" {
			n, err := strconv.Atoi(conf.TSDBStorageNWorkers)
			if err != nil {
				panic(err)
			}
			nWorkers = n
		}
		storage = tsdbstorage.New(conf.DBDSN(), nWorkers)
	} else {
		nWorkers := runtime.NumCPU()
		if conf.ClickhouseStorageNWorkers != "" {
			n, err := strconv.Atoi(conf.ClickhouseStorageNWorkers)
			if err != nil {
				panic(err)
			}
			nWorkers = n
		}
		storage = clickhousestorage.New(&clickhouse.Options{
			Auth: clickhouse.Auth{
				Database: conf.DBName,
				Username: conf.DBUser,
				Password: conf.DBPassword,
			},
			Addr:         []string{fmt.Sprintf("%s:%s", conf.DBHost, conf.DBPort)},
			MaxOpenConns: +5,
		}, nWorkers)
	}
	if err := storage.Begin(); err != nil {
		panic(err)
	}
	defer storage.Close()
	start, _ := time.Parse("2006-01-02", "2021-06-04")
	final, _ := time.Parse("2006-01-02", "2021-06-06")
	err := ingestor.Ingest(context.Background(), storage, config.GetConfig().FilesBucketName, start, final)
	if err != nil {
		panic(err)
	}
}
