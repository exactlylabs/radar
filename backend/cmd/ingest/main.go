package main

import (
	"context"
	"flag"
	"fmt"
	"runtime"
	"strconv"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/clickhousedb"
	"github.com/joho/godotenv"
)

func main() {
	startStr := flag.String("start", "2022-01-01", "Start date")
	endStr := flag.String("end", "2023-01-01", "Final date")
	updateViews := flag.Bool("update-views", false, "Whether to update the materialized views")
	swapTable := flag.Bool("swap-table", false, "Whether to first swap the existing measurements table in a temporary table and then switch back to the original")
	truncate := flag.Bool("truncate", false, "Whether to truncate before inserting")
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
	defer db.Close()
	start, _ := time.Parse("2006-01-02", *startStr)
	final, _ := time.Parse("2006-01-02", *endStr)
	s := storages.IngestorAppStorages{
		GeospaceStorage: clickhousestorages.NewGeospaceStorage(db),
		ASNOrgStorage:   clickhousestorages.NewASNOrgStorage(db),
		MeasurementStorage: clickhousestorages.NewMeasurementStorage(db, &clickhousestorages.MeasurementStorageOpts{
			NWorkers:  nWorkers,
			SwapTable: *swapTable,
			Truncate:  *truncate,
		}),
		SummariesStorage: clickhousestorages.NewSummariesStorage(db),
	}
	t := time.Now()
	err = ingestor.Ingest(context.Background(), s, config.GetConfig().FilesBucketName, start, final, *updateViews)
	if err != nil {
		panic(err)
	}
	fmt.Println("Finished Ingestion in ", time.Since(t))
}
