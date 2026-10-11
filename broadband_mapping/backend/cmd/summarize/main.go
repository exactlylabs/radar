package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/joho/godotenv"
)

var (
	full       = flag.Bool("full", false, "Rebuild every summary from all measurements into <table>_next tables, leaving the live tables untouched")
	switchOver = flag.Bool("switch", false, "Put the <table>_next tables built by -full live (the replaced tables are kept as <table>_old) and drop the old *_tmp views")
	from       = flag.String("from", "", "Update, in the live tables, the summaries of every period containing a day from this date (YYYY-MM-DD)")
	to         = flag.String("to", "", "... to this date (YYYY-MM-DD), default today")
	maxThreads = flag.Int("max-threads", clickhousestorages.DefaultSummarizerOptions.MaxThreads, "ClickHouse max_threads per query")
	shardRows  = flag.Uint64("shard-rows", clickhousestorages.DefaultSummarizerOptions.ShardTargetRows, "Measurements per shard (bounds memory per query)")
	windows    = flag.String("windows", "", "Comma separated windows to build (alltime,year,semester,quarter,month,week), default all")
)

func main() {
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
	db := clickhousestorages.DB(conf, nWorkers)
	defer db.Close()

	opts := clickhousestorages.DefaultSummarizerOptions
	opts.MaxThreads = *maxThreads
	opts.ShardTargetRows = *shardRows
	if *windows != "" {
		opts.Windows = strings.Split(*windows, ",")
	}
	s := clickhousestorages.NewSummarizer(db, opts)

	t := time.Now()
	var err error
	switch {
	case *full:
		log.Println("Rebuilding all summaries into *_next tables")
		err = s.RebuildAll()
	case *switchOver:
		log.Println("Switching *_next tables live")
		err = s.SwitchOver()
	case *from != "":
		var start, end time.Time
		start, err = time.Parse(time.DateOnly, *from)
		if err == nil {
			end = time.Now().UTC()
			if *to != "" {
				end, err = time.Parse(time.DateOnly, *to)
			}
		}
		if err == nil {
			log.Printf("Updating summaries from %s to %s\n", start.Format(time.DateOnly), end.Format(time.DateOnly))
			err = s.Update(start, end)
		}
	default:
		fmt.Fprintln(os.Stderr, "Pass one of -full, -switch or -from")
		flag.Usage()
		os.Exit(2)
	}
	if err != nil {
		panic(err)
	}
	log.Printf("Finished in %v\n", time.Since(t))
}
