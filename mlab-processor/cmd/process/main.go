package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers/flavors"
	"github.com/exactlylabs/mlab-processor/pkg/app/ipgeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/app/measurementlinker"
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
	"github.com/exactlylabs/mlab-processor/pkg/app/reversegeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

var yesterday = time.Now().Add(-24 * time.Hour).Round(24 * time.Hour)

// CMD Option Flags
var startPtr = flag.String("start", "2019-05-13", "First date to run pipeline from")
var endPtr = flag.String("end", yesterday.Format("2006-01-02"), "Last date to run pipeline from (inclusive). If empty, set to yesterday")
var rerunPtr = flag.Bool("rerun", false, "Ignore previously collected data and force reprocessing")
var debug = flag.Bool("debug", false, "Print some debugging information")
var storageType = flag.String("storage", "local", "Storage type to store the files (local, gcs, b2)")

func usage() {
	fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
	fmt.Fprintf(os.Stderr, "  %s [options] fetch|ipgeocode|reversegeocode|measurementlink|all\n", os.Args[0])
	fmt.Fprintf(os.Stderr, "\nOptions:\n")

	flag.PrintDefaults()
}

func main() {
	flag.Parse()
	args := flag.Args()
	if len(args) == 0 {
		usage()
		os.Exit(1)
	}

	start, err := time.Parse("2006-01-02", *startPtr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Invalid start date: %s\n", err)
		usage()
		os.Exit(1)
	}

	end, err := time.Parse("2006-01-02", *endPtr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Invalid end date: %s\n", err)
		usage()
		os.Exit(1)
	}

	conf := config.GetConfig()
	storage, err := flavors.GetStorageFromConfig(context.Background(), conf)
	if err != nil {
		log.Fatalf("Error getting storage: %v", err)
	}

	dateRange := helpers.DateRange(start, end)
	pipelineStr := make([]string, 0)
	for _, arg := range args {
		switch arg {
		case fetcher.StepName:
			pipelineStr = append(pipelineStr, fetcher.StepName)
		case ipgeocoder.StepName:
			pipelineStr = append(pipelineStr, ipgeocoder.StepName)
		case reversegeocoder.StepName:
			pipelineStr = append(pipelineStr, reversegeocoder.StepName)
		case measurementlinker.StepName:
			pipelineStr = append(pipelineStr, measurementlinker.StepName)
		case "all":
			pipelineStr = []string{
				fetcher.StepName,
				ipgeocoder.StepName,
				reversegeocoder.StepName,
				measurementlinker.StepName,
			}
		default:
			usage()
			os.Exit(1)
		}
	}

	dsProvider := flavors.NewAvroStorageDataStoreFactory(storage)
	pipeline.RunPipeline(dsProvider, dateRange, pipelineStr, *rerunPtr)

	if *debug {
		timer.PrintAll()
	}
}
