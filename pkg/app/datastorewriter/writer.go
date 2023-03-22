// datastorewriter package manages the writting of objects into a DataStore object in a separate goroutine.
package datastorewriter

import (
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

// DataStoreWriter is used to write non-blocking to a DataStore.
// It buffers up to NumCPU items to be written to it before starting blocking
type DataStoreWriter struct {
	ds datastore.DataStore
	ch chan any
	wg *sync.WaitGroup
}

func NewWriter(ds datastore.DataStore) *DataStoreWriter {
	w := &DataStoreWriter{
		ds: ds,
		wg: &sync.WaitGroup{},
		ch: make(chan any, runtime.NumCPU()),
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
