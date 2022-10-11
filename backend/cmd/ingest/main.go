package main

import (
	"context"
	"flag"
	"fmt"
	"runtime"
	"strconv"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor"
	"github.com/joho/godotenv"
)

func main() {
	startStr := flag.String("start", "2022-01-01", "Start date")
	finalStr := flag.String("final", "2023-01-01", "Final date")
	updateViews := flag.Bool("update-views", false, "Whether to update the materialized views")
	useTempTable := flag.Bool("temp-table", false, "Whether to insert measurements in a temporary table and then switch to the original")
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
	storage := clickhousestorage.New(&clickhousestorage.ChStorageOptions{
		DBName:       conf.DBName,
		Username:     conf.DBUser,
		Password:     conf.DBPassword,
		Host:         conf.DBHost,
		Port:         conf.DBPort(),
		NWorkers:     nWorkers,
		UpdateViews:  *updateViews,
		UseTempTable: *useTempTable,
	})

	start, _ := time.Parse("2006-01-02", *startStr)
	final, _ := time.Parse("2006-01-02", *finalStr)
	t := time.Now()
	err := ingestor.Ingest(context.Background(), storage, config.GetConfig().FilesBucketName, start, final)
	if err != nil {
		panic(err)
	}
	fmt.Println("Finished Ingestion in ", time.Since(t))
}
