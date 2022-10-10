package main

import (
	"log"
	"time"

	gcpstorage "cloud.google.com/go/storage"
	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers/flavors"
	"github.com/exactlylabs/mlab-processor/pkg/app/ipgeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/app/measurementlinker"
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
	"github.com/exactlylabs/mlab-processor/pkg/app/reversegeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/storagedatastore"
)

var pipelineStr = []string{
	fetcher.StepName,
	ipgeocoder.StepName,
	reversegeocoder.StepName,
	measurementlinker.StepName,
}

func main() {
	ctx := helpers.InterruptSignalContext()
	cli, err := gcpstorage.NewClient(ctx)
	if err != nil {
		panic(err)
	}
	bucket := cli.Bucket(config.GetConfig().UploadBucketName)
	uploader := storagedatastore.NewUploader(bucket)
	defer uploader.Close()
	dsProvider := flavors.NewAvroStorageDataStoreFactory(uploader)
	log.Println("Starting Processor Service")

	startTime, _ := time.Parse("2006-01-02", config.GetConfig().EarliestDate)
	log.Println("Initiating main loop")

	nextMidnight := time.Now().UTC()
	log.Printf("Triggering next process task at %v\n", nextMidnight)
	for {
		select {
		case <-time.NewTimer(time.Until(nextMidnight)).C:
			// Safer to have a two days delay, since we don't know when all data is going to be uploaded to MLab's bucket.
			// I did this after seeing that we were missing data if doing a single day of delay
			finalTime := time.Now().UTC().AddDate(0, 0, -2).Truncate(time.Hour * 24)
			if startTime.Before(finalTime) {
				dateRange := helpers.DateRange(startTime, finalTime)
				if len(dateRange) > 0 {
					log.Printf("Processing data from %v to %v\n", dateRange[0], dateRange[len(dateRange)-1])
				}
				pipeline.RunPipeline(dsProvider, dateRange, pipelineStr, false)
			}

			nextMidnight = time.Now().UTC().Add(time.Hour * 24).Truncate(time.Hour * 24)
		case <-ctx.Done():
			return
		}
	}
}
