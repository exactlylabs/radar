package main

import (
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/geocoder"
	"github.com/exactlylabs/mlab-processor/pkg/app/ipgeocoder"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

func usage() {
	fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
	fmt.Fprintf(os.Stderr, "  %s [options] fetch|geoip|geocode|all\n", os.Args[0])
	fmt.Fprintf(os.Stderr, "\nOptions:\n")

	flag.PrintDefaults()
}

func main() {
	yesterday := time.Now().Add(-24 * time.Hour).Round(24 * time.Hour)

	startPtr := flag.String("start", "2019-05-13", "First date to run pipeline from")
	endPtr := flag.String("end", yesterday.Format("2006-01-02"), "Last date to run pipeline from (inclusive). If empty, set to yesterday")
	rerunPtr := flag.Bool("rerun", false, "Ignore previously collected data and force reprocessing")
	debug := flag.Bool("debug", false, "Print some debugging information")

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

	switch args[0] {
	case "fetch":
		fetcher.Fetch(start, end, *rerunPtr)
	case "geoip":
		ipgeocoder.Geocode(start, end, *rerunPtr)
	case "geocode":
		geocoder.ReverseGeocode(start, end, *rerunPtr)
	case "all":
		fetcher.Fetch(start, end, *rerunPtr)
		ipgeocoder.Geocode(start, end, *rerunPtr)
		geocoder.ReverseGeocode(start, end, *rerunPtr)
	default:
		usage()
		os.Exit(1)
	}
	if *debug {
		timer.PrintAll()
	}

}
