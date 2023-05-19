package localdatastore

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

// localDataStore implements writer.ItemWriter interface, storing data locally
type localDataStore struct {
	encoderProvider encoders.ItemEncoderFactory
	decoderProvider encoders.ItemDecoderFactory
	path            string
	obj             any
}

func New(path string, encoderProvider encoders.ItemEncoderFactory, decoderProvider encoders.ItemDecoderFactory, obj any) (datastore.DataStore, error) {
	return &localDataStore{
		encoderProvider: encoderProvider,
		decoderProvider: decoderProvider,
		path:            path,
		obj:             obj,
	}, nil
}

func (ds *localDataStore) ItemWriter() (datastore.ItemWriter, error) {
	file, err := openFile(ds.path)
	if err != nil {
		return nil, err
	}
	encoder, err := ds.encoderProvider(file)
	if err != nil {
		return nil, fmt.Errorf("localdatastore.ItemWriter encoderProvider error: %w", err)
	}
	writer := newItemWriter(file, encoder)
	return writer, nil
}

func (ds *localDataStore) ItemsReader() (datastore.StoreItemIterator, error) {
	f, err := os.Open(ds.path)
	if err != nil {
		return nil, fmt.Errorf("localdatastore.Read Open error: %w", err)
	}
	decoder, err := ds.decoderProvider(f)
	if err != nil {
		return nil, fmt.Errorf("localdatastore.Read decoderProvider error: %w", err)
	}
	it := datastore.NewIterator(decoder, ds.obj)
	return it, nil
}

func (ds *localDataStore) FileReader() (io.ReadCloser, error) {
	f, err := os.Open(ds.path)
	if err != nil {
		return nil, fmt.Errorf("localdatastore.Read Open error: %w", err)
	}

	return f, nil
}

func (ds *localDataStore) FileName() string {
	return filepath.Base(ds.path)
}

func (ds *localDataStore) Delete() error {
	if err := os.Remove(ds.path); err != nil {
		return fmt.Errorf("localdatastore.Delete Remove error: %w", err)
	}
	return nil
}

func (ds *localDataStore) Exists() bool {
	info, err := os.Stat(ds.path)
	if err != nil {
		return false
	}
	if info.Size() == 0 {
		return false
	}
	return true
}

// Flush is noop for this storage
func (ds *localDataStore) Flush() error {
	return nil
}

// Clear is noop for this storage
func (ds *localDataStore) Clear() error {
	return nil
}

func openFile(path string) (*os.File, error) {
	dir := filepath.Dir(path)
	mdErr := os.MkdirAll(dir, 0755)
	if mdErr != nil {
		return nil, fmt.Errorf("storage.writerWorker mdErr: %v", mdErr)
	}

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0660)
	if err != nil {
		return nil, fmt.Errorf("storage.writerWorker OpenFile err: %v", err)
	}
	return f, nil
}
