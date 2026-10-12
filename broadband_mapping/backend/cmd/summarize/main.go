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
	full       = flag.Bool("full", false, "Rebuild every summary and ip_medians from all tests into <table>_next tables, leaving the live tables untouched")
	switchOver = flag.Bool("switch", false, "Put the <table>_next tables built by -full live (the replaced tables are kept as <table>_old) and drop the old *_tmp views")
	from       = flag.String("from", "", "Update, in the live tables, the summaries of every period containing a day from this date (YYYY-MM-DD)")
	to         = flag.String("to", "", "... to this date (YYYY-MM-DD), default today")
	maxThreads = flag.Int("max-threads", clickhousestorages.DefaultSummarizerOptions.MaxThreads, "ClickHouse max_threads of a query running alone (shard queries share it)")
	shardRows  = flag.Uint64("shard-rows", clickhousestorages.DefaultSummarizerOptions.ShardTargetRows, "Tests per shard query (whole states) and per-IP rows per outer aggregation query")
	maxMemory  = flag.Uint64("max-memory", clickhousestorages.DefaultSummarizerOptions.MaxMemoryUsage, "ClickHouse max_memory_usage per query, bytes")
	spill      = flag.Uint64("spill-bytes", clickhousestorages.DefaultSummarizerOptions.MaxBytesBeforeExternalGroupBy, "ClickHouse max_bytes_before_external_group_by, bytes")
	insertThr  = flag.Int("max-insert-threads", clickhousestorages.DefaultSummarizerOptions.MaxInsertThreads, "ClickHouse max_insert_threads of INSERT ... SELECT")
	parallel   = flag.Int("parallel", clickhousestorages.DefaultSummarizerOptions.Parallel, "Shard queries run at the same time (each streams in key order, under 1 GiB)")
	validate   = flag.String("validate-before", "", "Compare <table>_next with the live tables for the buckets that ended before this date (YYYY-MM-DD); semester and all-time are skipped")
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
	opts.MaxMemoryUsage = *maxMemory
	opts.MaxBytesBeforeExternalGroupBy = *spill
	opts.MaxInsertThreads = *insertThr
	opts.Parallel = *parallel
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
	case *validate != "":
		var before time.Time
		if before, err = time.Parse("2006-01-02", *validate); err == nil {
			var results []clickhousestorages.ValidationResult
			if results, err = s.Validate(before); err == nil {
				bad := 0
				for _, r := range results {
					status := "OK"
					if r.OnlyLive+r.OnlyNext > 0 {
						status = "DIFF"
						bad++
					}
					log.Printf("%-4s %s: %d buckets, %d rows only live, %d rows only next\n", status, r.Table, r.Buckets, r.OnlyLive, r.OnlyNext)
				}
				if bad > 0 {
					log.Printf("%d tables differ\n", bad)
					os.Exit(1)
				}
			}
		}
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
		fmt.Fprintln(os.Stderr, "Pass one of -full, -validate-before, -switch or -from")
		flag.Usage()
		os.Exit(2)
	}
	if err != nil {
		panic(err)
	}
	log.Printf("Finished in %v\n", time.Since(t))
}
