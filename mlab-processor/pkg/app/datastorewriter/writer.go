// datastorewriter package manages the writting of objects into a DataStore object in a separate goroutine.
package datastorewriter

import (
	"fmt"
	"runtime"
	"sync"
	"sync/atomic"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

// DataStoreWriter is used to write non-blocking to a DataStore.
// It buffers up to NumCPU items to be written to it before starting blocking.
// Write errors are kept (the first one) and returned by Close; items sent after an
// error are discarded.
type DataStoreWriter struct {
	ds      datastore.DataStore
	ch      chan any
	wg      *sync.WaitGroup
	written atomic.Int64
	err     error
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
	writer, err := ds.ItemWriter()
	if err != nil {
		w.err = fmt.Errorf("datastorewriter: ItemWriter: %w", err)
		for range ch {
		}
		return
	}
	for item := range ch {
		if w.err != nil {
			continue
		}
		start := time.Now()
		if wErr := writer.Write(item); wErr != nil {
			w.err = fmt.Errorf("datastorewriter: write: %w", wErr)
			continue
		}
		timer.TimeIt(start, "WriteWorker")
		w.written.Add(1)
	}
	if err := writer.Close(); err != nil && w.err == nil {
		w.err = fmt.Errorf("datastorewriter: flush: %w", err)
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

// Written returns the number of items written so far (final after Close).
func (w *DataStoreWriter) Written() int64 {
	return w.written.Load()
}

// Close waits for pending items, flushes and closes the file, and returns the first error.
func (w *DataStoreWriter) Close() error {
	close(w.ch)
	w.wg.Wait()
	return w.err
}
