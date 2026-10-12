package datastore

import (
	"os"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

type itemWriter struct {
	file    *os.File
	encoder encoders.FileEncoder
}

func NewItemWriter(file *os.File, encoder encoders.FileEncoder) ItemWriter {
	return &itemWriter{file: file, encoder: encoder}
}

// Close flushes the encoder and closes the file (implements datastore.ItemWriter)
func (lw *itemWriter) Close() error {
	if err := lw.encoder.Flush(); err != nil {
		lw.file.Close()
		return errors.W(err)
	}
	if err := lw.file.Close(); err != nil {
		return errors.W(err)
	}
	return nil
}

// Write implements datastore.ItemWriter
func (lw *itemWriter) Write(item any) error {
	if err := lw.encoder.EncodeItem(item); err != nil {
		return errors.W(err)
	}
	return nil
}
