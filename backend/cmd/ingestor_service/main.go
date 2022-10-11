package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/joho/godotenv"
)

var defaultStartTime = time.Date(2020, 7, 1, 0, 0, 0, 0, time.UTC)

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
	} else {
		truncated := measStartTime.Truncate(time.Hour*24).AddDate(0, 0, 1)
		measStartTime = &truncated
	}

	endTime := time.Now().Truncate(time.Hour * 24)
	start := time.Now()
	log.Printf("Requesting insertions from %v to %v\n", measStartTime, endTime)
	err = ingestor.Ingest(ctx, storage, config.GetConfig().FilesBucketName, *measStartTime, endTime)
	if err != nil {
		panic(err)
	}
	log.Println("Finished in", time.Since(start))
}

func main() {
	startStr := flag.String("default-start", "2020-07-01", "Date to start ingesting when no data is present in the DB")
	flag.Parse()
	startT, err := time.Parse("2006-01-02", *startStr)
	if err != nil {
		panic("default-start is not a valid date. Use format YYYY-mm-dd")
	}
	defaultStartTime = startT
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
		DBName:      conf.DBName,
		Username:    conf.DBUser,
		Password:    conf.DBPassword,
		Host:        conf.DBHost,
		Port:        conf.DBPort(),
		NWorkers:    nWorkers,
		UpdateViews: true,
		// When ingesting, the view gets updated and ends up in a bad state.
		// This prevents it from happening
		SwapTempTable: true,
	})
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
