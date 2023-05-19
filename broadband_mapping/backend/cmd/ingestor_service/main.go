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

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/joho/godotenv"
)

func runInsertions(ctx context.Context, s storages.IngestorAppStorages) {
	if err := s.MeasurementStorage.Open(); err != nil {
		panic(err)
	}
	defer s.MeasurementStorage.Close()
	measStartTime, err := s.MeasurementStorage.LastDate()
	if err != nil {
		panic(err)
	}
	if measStartTime == nil {
		fmt.Println("Error: there's no previous data inserted into the database. You should call the ingest CLI first to backpopulate the DB")
		os.Exit(1)
	}

	endTime := time.Now().Truncate(time.Hour * 24)
	start := time.Now()
	log.Printf("Requesting insertions from %v to %v\n", measStartTime, endTime)
	err = ingestor.Ingest(ctx, s, config.GetConfig().FilesBucketName, *measStartTime, endTime, true)
	if err != nil {
		panic(err)
	}
	log.Println("Finished in", time.Since(start))
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

	db := clickhousestorages.DB(conf, nWorkers)
	defer db.Close()
	s := clickhousestorages.NewIngestorAppStorages(db, nWorkers, false)
	// Run a first time then, run once every x hour
	timer := time.NewTimer(time.Second)
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			runInsertions(ctx, s)
			timer.Reset(time.Hour)
		}
	}
}
