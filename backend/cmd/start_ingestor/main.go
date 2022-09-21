package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/tsdbstorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
)

var defaultStartTime = time.Date(2020, 8, 1, 0, 0, 0, 0, time.UTC)

func runInsertions(ctx context.Context, storage ports.MeasurementsStorage) {
	err := storage.Begin()
	if err != nil {
		panic(err)
	}
	measStartTime, err := storage.LastMeasurementDate()
	if err != nil {
		panic(err)
	}
	if measStartTime == nil {
		measStartTime = &defaultStartTime
	}

	endTime := time.Now().Truncate(time.Hour * 24)
	start := time.Now()
	log.Printf("Requesting insertions from %v to %v\n", measStartTime, endTime)

	defer storage.Close()
	err = ingestor.Ingest(ctx, storage, config.GetConfig().FilesBucketName, *measStartTime, endTime)
	if err != nil {
		panic(err)
	}
	log.Println("Finished in", time.Now().Sub(start))
}

func main() {
	sigs := make(chan os.Signal)
	signal.Notify(sigs, syscall.SIGINT)
	ctx, cancel := context.WithCancel(context.Background())
	interrupts := 0
	go func() {
		for range sigs {
			if interrupts == 0 {
				log.Println("Received Interrupt signal. Stopping all contexts...")
				log.Println("Send another signal in case you wish to force shutdown")
				cancel()
				interrupts++
			} else {
				log.Println("Forcing Shutdown")
				os.Exit(0)
			}
		}
	}()
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
			MaxOpenConns: nWorkers + 5,
		}, nWorkers)
	}

	// Run a first time then, run once every x hour
	timer := time.NewTimer(time.Second)
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			runInsertions(ctx, storage)
			timer.Reset(time.Hour)
		}
	}
}
