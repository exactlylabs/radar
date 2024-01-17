package main

import (
	"flag"
	"log"
	"runtime"
	"strconv"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/joho/godotenv"
)

var start_index = flag.Int("start-from", 0, "View index to start summarize from")

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
	log.Println("Starting data Summarization.")
	t := time.Now()
	s := clickhousestorages.NewIngestorAppStorages(db, nWorkers, false)
	err := s.Summarize(*start_index)
	if err != nil {
		panic(err)
	}
	log.Println("Finished Summarizing data in %v", time.Since(t))
}
