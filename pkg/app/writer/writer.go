package writer

import (
	"fmt"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

type DataStoreWriter struct {
	ds datastore.DataStore
	ch chan any
	wg *sync.WaitGroup
}

func NewWriter(ds datastore.DataStore) *DataStoreWriter {
	w := &DataStoreWriter{
		ds: ds,
		wg: &sync.WaitGroup{},
		ch: make(chan any),
	}
	w.startWriterWorker(ds, w.ch)
	return w
}

func (w *DataStoreWriter) writerWorker(ds datastore.DataStore, ch chan any) {
	total := 0
	writer, err := ds.ItemWriter()
	if err != nil {
		panic(fmt.Errorf("datastore.writeWorker ItemWriter error: %w", err))
	}
	for item := range ch {
		func() {
			defer timer.TimeIt(time.Now(), "WriteWorker")
			wErr := writer.Write(item)
			if wErr != nil {
				panic(fmt.Errorf("datastore.writerWorker wErr: %v", wErr))
			}
		}()
		total++
	}
	if err := writer.Close(); err != nil {
		panic(fmt.Errorf("datastore.writeWorker flush err: %w", err))
	}
}

func (w *DataStoreWriter) startWriterWorker(ds datastore.DataStore, ch chan any) {
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		w.writerWorker(ds, ch)
	}()
}

func (w *DataStoreWriter) WriteItem(item any) {
	w.ch <- item
}

func (w *DataStoreWriter) Close() {
	close(w.ch)
	w.wg.Wait()
}
