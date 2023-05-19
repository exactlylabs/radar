package localdatastore

import (
	"fmt"
	"os"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

type localItemWriter struct {
	file    *os.File
	encoder encoders.FileEncoder
}

func newItemWriter(file *os.File, encoder encoders.FileEncoder) datastore.ItemWriter {
	return &localItemWriter{file: file, encoder: encoder}
}

// Close implements datastore.ItemWriter
func (lw *localItemWriter) Close() error {
	if err := lw.encoder.Flush(); err != nil {
		return fmt.Errorf("localdatastore.localItemWriter#Close Flush error: %w", err)
	}
	return nil
}

// Write implements datastore.ItemWriter
func (lw *localItemWriter) Write(item any) error {
	if err := lw.encoder.EncodeItem(item); err != nil {
		return fmt.Errorf("localdatastore.localItemWriter#Write EncodeItem error: %w", err)
	}
	return nil
}
