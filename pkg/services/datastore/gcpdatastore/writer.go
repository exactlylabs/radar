package gcpdatastore

import (
	"fmt"
	"os"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

type itemWriter struct {
	file    *os.File
	encoder encoders.FileEncoder
}

func newItemWriter(file *os.File, encoder encoders.FileEncoder) datastore.ItemWriter {
	return &itemWriter{file: file, encoder: encoder}
}

// Close implements datastore.ItemWriter
func (lw *itemWriter) Close() error {
	if err := lw.encoder.Flush(); err != nil {
		return fmt.Errorf("gcpdatastore.itemWriter#Close Flush: %w", err)
	}
	return nil
}

// Write implements datastore.ItemWriter
func (lw *itemWriter) Write(item any) error {
	if err := lw.encoder.EncodeItem(item); err != nil {
		return fmt.Errorf("gcpdatastore.itemWriter#Write EncodeItem: %w", err)
	}
	return nil
}
