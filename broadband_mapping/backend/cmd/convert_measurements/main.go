// convert_measurements fills the tests table (one row per test) from measurements (one row
// per test and geospace), month by month, and verifies the result. See
// docs/pipeline-rebuild-plan.md, "Production runbook".
//
//	convert_measurements -from 2009-01 -to 2026-08            # convert the months not converted yet
//	convert_measurements -from 2009-01 -to 2026-08 -strategy groupby   # the original one-GROUP-BY strategy
//	convert_measurements -from 2025-03 -to 2025-03 -redo      # convert a month again
//	convert_measurements -from 2009-01 -to 2026-08 -verify    # compare counts per month and geospace
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/joho/godotenv"
)

func main() {
	def := clickhousestorages.DefaultConverterOptions
	from := flag.String("from", "", "First month (YYYY-MM)")
	to := flag.String("to", "", "Last month (YYYY-MM), inclusive")
	verify := flag.Bool("verify", false, "Compare measurements and tests instead of converting")
	redo := flag.Bool("redo", false, "Convert months already converted again")
	repairUnknown := flag.Bool("repair-unknown-ids", false, "Replace the one ERROR_DISCOVERING_UUID test per month of an older conversion with those tests keyed by content, instead of converting (rebuild the summaries afterwards)")
	strategy := flag.String("strategy", def.Strategy, "join: common tests from their county row, the rest with GROUP BY; groupby: everything with one GROUP BY id (same result, slower)")
	classifyRows := flag.Uint64("classify-shard-rows", def.ClassifyShardRows, "join: source rows per classification query, hash shards of a month (0 = what fits in 60% of -max-memory)")
	chunk := flag.Int("chunk-months", def.ChunkMonths, "Months read from measurements per pass, aligned (12 = calendar years); measurements' parts span years, so smaller chunks read more")
	maxThreads := flag.Int("max-threads", def.MaxThreads, "ClickHouse max_threads")
	insertThreads := flag.Int("max-insert-threads", def.MaxInsertThreads, "ClickHouse max_insert_threads")
	maxMemory := flag.Uint64("max-memory", def.MaxMemoryUsage, "ClickHouse max_memory_usage per query, bytes")
	spill := flag.Uint64("spill-bytes", def.MaxBytesBeforeExternalGroupBy, "ClickHouse max_bytes_before_external_group_by, bytes")
	shards := flag.Int("shards", def.Shards, "Hash shards per chunk (0 = one per -shard-rows source rows)")
	shardRows := flag.Uint64("shard-rows", def.ShardRows, "Source rows per shard when -shards is 0; bounds the GROUP BY id memory")
	flag.Parse()
	if *from == "" || *to == "" {
		fmt.Fprintln(os.Stderr, "Pass -from and -to (YYYY-MM)")
		flag.Usage()
		os.Exit(2)
	}
	start, err := time.Parse("2006-01", *from)
	if err != nil {
		log.Fatal(err)
	}
	end, err := time.Parse("2006-01", *to)
	if err != nil {
		log.Fatal(err)
	}
	godotenv.Load()
	db := clickhousestorages.DB(config.GetConfig(), 1)
	defer db.Close()

	opts := clickhousestorages.ConverterOptions{
		Strategy:                      *strategy,
		ChunkMonths:                   *chunk,
		ClassifyShardRows:             *classifyRows,
		MaxThreads:                    *maxThreads,
		MaxInsertThreads:              *insertThreads,
		MaxMemoryUsage:                *maxMemory,
		MaxBytesBeforeExternalGroupBy: *spill,
		Shards:                        *shards,
		ShardRows:                     *shardRows,
		Redo:                          *redo,
	}
	c := clickhousestorages.NewConverter(db, opts)
	t := time.Now()
	if *repairUnknown {
		if err := c.RepairUnknownIDs(start, end); err != nil {
			log.Fatal(err)
		}
		log.Printf("repaired in %v", time.Since(t))
		return
	}
	if *verify {
		checks, err := c.Verify(start, end)
		if err != nil {
			log.Fatal(err)
		}
		bad := 0
		for _, ch := range checks {
			if !ch.OK() {
				bad++
			}
		}
		log.Printf("verified %d months in %v, %d differ\n", len(checks), time.Since(t), bad)
		if bad > 0 {
			os.Exit(1)
		}
		return
	}
	if err := c.Convert(start, end); err != nil {
		log.Fatal(err)
	}
	log.Printf("converted in %v\n", time.Since(t))
}
