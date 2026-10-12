// Command processor (deployed as mlab-processor) fetches M-Lab NDT tests, geocodes them
// and uploads one file per step and day.
//
// Default (one-shot, for a systemd timer): for every date from today-2 back to
// today-2-RECHECK_DAYS (or -from), process the date when it has no completeness record in
// the storage (completeness/<date>.json) or when M-Lab's archive now lists more tarballs
// than were processed; then exit. Exit status 1 when any date failed.
//
// -loop keeps the pre-v2 behaviour: stay resident and, every midnight UTC, run every date
// from EARLIEST_DATE to today-2, skipping steps whose output exists.
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
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
)

var (
	loop        = flag.Bool("loop", false, "Legacy resident mode: every midnight UTC process EARLIEST_DATE..today-2, skipping existing outputs")
	endStr      = flag.String("end", "", "Newest date to process (default: today-2 UTC)")
	fromStr     = flag.String("from", "", "Oldest date to check/process (default: end minus -recheck-days); use for a catch-up")
	recheckDays = flag.Int("recheck-days", 7, "How many days before -end to re-check for completeness")
	checkOnly   = flag.Bool("check-only", false, "Only print what would be processed")
	storageType = flag.String("storage", "", "Storage override: local, gcs, s3 (alias b2). Default: STORAGE_TYPE")
	workers     = flag.Int("workers", 0, "Tarballs fetched in parallel (default: number of CPUs)")
	lowMemory   = flag.Bool("low-memory", false, "Keep only one of the IP geocoder / shapes in memory at a time")
)

func main() {
	flag.Parse()
	ctx := helpers.InterruptSignalContext()
	conf := config.GetConfig()

	runner, storage, err := flavors.NewRunner(ctx, conf, *storageType, fetcher.Options{Workers: *workers})
	if err != nil {
		log.Fatalf("Error getting storage: %v", err)
	}
	defer storage.Close()
	runner.LowMemory = *lowMemory

	if *loop {
		runLoop(ctx, runner, conf)
		return
	}

	end := helpers.DaysAgo(time.Now(), 2)
	if *endStr != "" {
		if end, err = time.Parse("2006-01-02", *endStr); err != nil {
			log.Fatalf("invalid -end: %v", err)
		}
	}
	start := end.AddDate(0, 0, -*recheckDays)
	if *fromStr != "" {
		if start, err = time.Parse("2006-01-02", *fromStr); err != nil {
			log.Fatalf("invalid -from: %v", err)
		}
	}
	log.Printf("Processor one-shot: checking %s .. %s", start.Format("2006-01-02"), end.Format("2006-01-02"))

	if *checkOnly {
		failed := 0
		for d := end; !d.Before(start); d = d.AddDate(0, 0, -1) {
			dec, err := runner.Check(ctx, d)
			if err != nil {
				fmt.Printf("%s check failed: %v\n", d.Format("2006-01-02"), err)
				failed++
				continue
			}
			action := "ok"
			if dec.Process {
				action = "PROCESS"
			}
			fmt.Printf("%s %s: %s\n", d.Format("2006-01-02"), action, dec.Reason)
		}
		if failed > 0 {
			os.Exit(1)
		}
		return
	}

	failed := runner.RunWindow(ctx, start, end)
	runner.Release()
	if len(failed) > 0 {
		var ds []string
		for _, d := range failed {
			ds = append(ds, d.Format("2006-01-02"))
		}
		log.Printf("Processor one-shot finished with %d failed date(s): %v", len(failed), ds)
		os.Exit(1)
	}
	log.Println("Processor one-shot finished")
}

func runLoop(ctx context.Context, runner *pipeline.Runner, conf *config.ProcessorConfig) {
	log.Println("Starting Processor Service (loop mode)")
	startTime, err := time.Parse("2006-01-02", conf.EarliestDate)
	if err != nil {
		log.Fatalf("invalid EARLIEST_DATE: %v", err)
	}
	next := time.Now().UTC()
	for {
		select {
		case <-time.After(time.Until(next)):
			// Two days of delay: M-Lab's archive is not complete after one.
			finalTime := helpers.DaysAgo(time.Now(), 2)
			if startTime.Before(finalTime) {
				dateRange := helpers.DateRange(startTime, finalTime)
				log.Printf("Processing data from %v to %v\n", dateRange[0], dateRange[len(dateRange)-1])
				failed := runner.RunRange(ctx, dateRange, pipeline.AllSteps, false)
				if len(failed) > 0 {
					log.Printf("%d date(s) failed: %v", len(failed), failed)
				}
				runner.Release()
			}
			next = time.Now().UTC().Add(24 * time.Hour).Truncate(24 * time.Hour)
			log.Printf("Next run at %v", next)
		case <-ctx.Done():
			return
		}
	}
}
