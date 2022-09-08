package pipeline

import (
	"context"
	"log"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
)

func RunPipeline(dsProvider DataStoreProvider, dateRange []time.Time, pipeline []string, rerun bool) {
	maxLocalFiles := 2 // amount of latest files to keep locally if upload is enabled
	files := make(map[string][]datastore.DataStore)
	ctx := NewContext(context.Background())
	for _, date := range dateRange {
		for _, stepName := range pipeline {
			log.Printf("Running %v for date %v\n", stepName, date)
			processor, exists := availableProcessors[stepName]
			ds, err := dsProvider(stepName, date, nil)
			if err != nil {
				panic(err)
			}
			if !exists || !rerun && ds.Exists() {
				continue
			}
			ds = processor(ctx, dsProvider, date)
			if ds == nil {
				continue
			}
			err = ds.Commit()
			if err != nil {
				panic(err)
			}

			if _, exists := files[stepName]; !exists {
				files[stepName] = make([]datastore.DataStore, 0)
			}
			if len(files[stepName]) >= maxLocalFiles {
				// Ensure we only have temp. data from the last "maxLocalFiles"
				log.Printf("Clearing %v\n", files[stepName][0])
				files[stepName][0].Clear()
				files[stepName] = files[stepName][1:]
			}
			files[stepName] = append(files[stepName], ds)
		}
	}
}
