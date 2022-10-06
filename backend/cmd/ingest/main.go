package main

import (
	"context"
	"flag"
	"fmt"
	_ "net/http/pprof"
	"runtime"
	"strconv"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor"
	"github.com/joho/godotenv"
)

func main() {
	startStr := flag.String("start", "2022-01-01", "Start date")
	finalStr := flag.String("final", "2023-01-01", "Final date")
	flag.Parse()
	godotenv.Load()
	conf := config.GetConfig()
	nWorkers := runtime.NumCPU()
	if conf.ClickhouseStorageNWorkers != "" {
		n, err := strconv.Atoi(conf.ClickhouseStorageNWorkers)
		if err != nil {
			panic(err)
		}
		nWorkers = n
	}
	storage := clickhousestorage.New(&clickhouse.Options{
		Auth: clickhouse.Auth{
			Database: conf.DBName,
			Username: conf.DBUser,
			Password: conf.DBPassword,
		},
		Addr:         []string{fmt.Sprintf("%s:%s", conf.DBHost, conf.DBPort)},
		MaxOpenConns: nWorkers + 5,
	}, nWorkers, true)
	if err := storage.Begin(); err != nil {
		panic(err)
	}
	defer storage.Close()
	start, _ := time.Parse("2006-01-02", *startStr)
	final, _ := time.Parse("2006-01-02", *finalStr)
	err := ingestor.Ingest(context.Background(), storage, config.GetConfig().FilesBucketName, start, final)
	if err != nil {
		panic(err)
	}
}
