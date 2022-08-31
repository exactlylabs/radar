package main

import (
	_ "net/http/pprof"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/tsdbstorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor"
)

func main() {
	conf := config.GetConfig()
	storage := tsdbstorage.New(conf.DBDSN())
	if err := storage.Begin(); err != nil {
		panic(err)
	}
	defer storage.Close()
	start, _ := time.Parse("2006-01-02", "2021-10-01")
	final, _ := time.Parse("2006-01-02", "2021-11-01")
	err := ingestor.Ingest(storage, config.GetConfig().FilesBucketName, start, final)
	if err != nil {
		panic(err)
	}
}
