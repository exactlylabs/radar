// Command process (deployed as process-mlab) runs pipeline steps for a date range by hand,
// e.g. to refetch short days:
//
//	process-mlab -start 2025-02-05 -end 2025-02-11 -rerun -storage b2 all
package main

import (
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
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
	"github.com/exactlylabs/mlab-processor/pkg/app/reversegeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

var yesterday = helpers.DaysAgo(time.Now(), 1)

// CMD Option Flags
var startPtr = flag.String("start", "2019-05-13", "First date to run pipeline from")
var endPtr = flag.String("end", yesterday.Format("2006-01-02"), "Last date to run pipeline from (inclusive). If empty, set to yesterday")
var rerunPtr = flag.Bool("rerun", false, "Ignore previously collected data and force reprocessing")
var debug = flag.Bool("debug", false, "Print some debugging information")
var storageType = flag.String("storage", "", "Storage type to store the files (local, gcs, s3 or its alias b2). Default: STORAGE_TYPE env")
var workers = flag.Int("workers", 0, "Tarballs fetched in parallel (default: number of CPUs)")
var lowMemory = flag.Bool("low-memory", false, "Keep only one of the IP geocoder / shapes in memory at a time")

func usage() {
	fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
	fmt.Fprintf(os.Stderr, "  %s [options] fetch|ipgeocode|reversegeocode|all ...\n", os.Args[0])
	fmt.Fprintf(os.Stderr, "\nSteps run in pipeline order. A step whose output exists is skipped unless -rerun\n")
	fmt.Fprintf(os.Stderr, "or an earlier step ran for the same date. A date is recorded complete\n")
	fmt.Fprintf(os.Stderr, "(completeness/<date>.json) only when all three steps ran.\n")
	fmt.Fprintf(os.Stderr, "\nOptions:\n")

	flag.PrintDefaults()
}

func main() {
	flag.Usage = usage
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

	steps := []string{}
	for _, arg := range args {
		switch arg {
		case fetcher.StepName, ipgeocoder.StepName, reversegeocoder.StepName:
			steps = append(steps, arg)
		case "all":
			steps = pipeline.AllSteps
		case "measurementlink":
			fmt.Fprintf(os.Stderr, "the measurementlink step was removed (its output was never used)\n")
			os.Exit(1)
		default:
			usage()
			os.Exit(1)
		}
	}

	ctx := helpers.InterruptSignalContext()
	conf := config.GetConfig()
	runner, storage, err := flavors.NewRunner(ctx, conf, *storageType, fetcher.Options{Workers: *workers})
	if err != nil {
		log.Fatalf("Error getting storage: %v", err)
	}
	defer storage.Close()
	runner.LowMemory = *lowMemory

	dateRange := helpers.DateRange(start, end)
	log.Printf("Running %v for %d date(s) %s .. %s (rerun=%v)", steps, len(dateRange), *startPtr, *endPtr, *rerunPtr)
	failed := runner.RunRange(ctx, dateRange, steps, *rerunPtr)
	runner.Release()

	if *debug {
		timer.PrintAll()
	}
	if len(failed) > 0 {
		var ds []string
		for _, d := range failed {
			ds = append(ds, d.Format("2006-01-02"))
		}
		log.Printf("%d date(s) failed: %v", len(failed), ds)
		os.Exit(1)
	}
}
