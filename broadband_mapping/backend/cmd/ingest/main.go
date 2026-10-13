// ingest loads the ipgeocode/reversegeocode files of a date range into the tests table, or
// repairs given days.
//
//	ingest -start 2022-01-01 -end 2023-01-01               # backfill (days must not be ingested yet)
//	ingest -repair 2025-02-05,2025-02-06 -summarize        # add the tests of the days' files missing by id
//	ingest -repair 2010-02-01,2010-02-02 -replace -summarize  # replace the days' tests (web100 era: random ids)
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/s3storage"
	"github.com/joho/godotenv"
)

func main() {
	startStr := flag.String("start", "", "First date (YYYY-MM-DD)")
	endStr := flag.String("end", "", "Date after the last (YYYY-MM-DD)")
	repair := flag.String("repair", "", "Comma separated days (YYYY-MM-DD) to repair instead of -start/-end")
	replace := flag.Bool("replace", false, "With -repair: replace the days' tests by the files' instead of adding the missing ids")
	summarize := flag.Bool("summarize", false, "Update the summaries of the ingested days")
	flag.Parse()
	godotenv.Load()
	conf := config.GetConfig()
	nWorkers := runtime.NumCPU()
	if conf.ClickhouseStorageNWorkers != "" {
		n, err := strconv.Atoi(conf.ClickhouseStorageNWorkers)
		if err != nil {
			log.Fatal(err)
		}
		nWorkers = n
	}
	db := clickhousestorages.DB(conf, clickhousestorages.IngestorConnections(nWorkers))
	defer db.Close()
	s := clickhousestorages.NewIngestorAppStorages(db, nWorkers)
	storage, err := s3storage.New(conf.FilesBucketName, conf.S3AccessKey, conf.S3SecretKey, conf.S3Endpoint, conf.S3Region)
	if err != nil {
		log.Fatal(err)
	}
	t := time.Now()
	switch {
	case *repair != "":
		days := []time.Time{}
		for _, d := range strings.Split(*repair, ",") {
			day, err := time.Parse("2006-01-02", strings.TrimSpace(d))
			if err != nil {
				log.Fatal(err)
			}
			days = append(days, day)
		}
		err = ingestor.Repair(context.Background(), s, storage, days, *replace, *summarize)
	case *startStr != "" && *endStr != "":
		var start, end time.Time
		if start, err = time.Parse("2006-01-02", *startStr); err != nil {
			log.Fatal(err)
		}
		if end, err = time.Parse("2006-01-02", *endStr); err != nil {
			log.Fatal(err)
		}
		err = ingestor.Ingest(context.Background(), s, storage, start, end, nil, *summarize, ingestor.FetchOptions{})
	default:
		fmt.Fprintln(os.Stderr, "Pass -start and -end, or -repair")
		flag.Usage()
		os.Exit(2)
	}
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Finished in", time.Since(t))
}
