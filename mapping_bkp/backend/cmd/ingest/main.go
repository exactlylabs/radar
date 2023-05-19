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
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/joho/godotenv"
)

func main() {
	startStr := flag.String("start", "2022-01-01", "Start date")
	endStr := flag.String("end", "2023-01-01", "Final date")
	updateViews := flag.Bool("update-views", false, "Whether to update the materialized views")
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
	start, _ := time.Parse("2006-01-02", *startStr)
	final, _ := time.Parse("2006-01-02", *endStr)
	db := clickhousestorages.DB(conf, nWorkers)
	defer db.Close()
	s := clickhousestorages.NewIngestorAppStorages(db, nWorkers, *truncate)
	t := time.Now()
	err := ingestor.Ingest(context.Background(), s, config.GetConfig().FilesBucketName, start, final, *updateViews)
	if err != nil {
		panic(err)
	}
	fmt.Println("Finished Ingestion in ", time.Since(t))
}
