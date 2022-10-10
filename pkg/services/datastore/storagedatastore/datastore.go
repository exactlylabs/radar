package storagedatastore

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

// storageDataStore implements datastore.DataStore interface, storing data in in GCP Storage
type storageDataStore struct {
	encoderProvider encoders.ItemEncoderFactory
	decoderProvider encoders.ItemDecoderFactory
	path            string
	obj             any
	uploader        *Uploader
	ongoingFiles    map[string]bool
}

func New(uploader *Uploader, path string, encoderProvider encoders.ItemEncoderFactory, decoderProvider encoders.ItemDecoderFactory, obj any) (datastore.DataStore, error) {
	return &storageDataStore{
		encoderProvider: encoderProvider,
		decoderProvider: decoderProvider,
		path:            path,
		obj:             obj,
		uploader:        uploader,
		ongoingFiles:    make(map[string]bool),
	}, nil
}

func (ds *storageDataStore) localPath() string {
	return filepath.Join("./output", ds.path)
}

// ItemWriter returns a writer that stores locally. The upload happens only when commit
func (ds *storageDataStore) ItemWriter() (datastore.ItemWriter, error) {
	file, err := openFile(ds.localPath())
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

// ItemsReader checks if the file exists locally and returns it, otherwise, it  retrieve from storage
func (ds *storageDataStore) ItemsReader() (datastore.StoreItemIterator, error) {
	f, err := ds.FileReader()
	if err != nil {
		return nil, fmt.Errorf("localdatastorage.storageDataStore#ItemsReader FileReader: %w", err)
	}
	decoder, err := ds.decoderProvider(f)
	if err != nil {
		return nil, fmt.Errorf("localdatastore.storageDataStore#Read decoderProvider error: %w", err)
	}
	it := datastore.NewIterator(decoder, ds.obj)
	return it, nil
}

// FileReader obtains the object either from a temporary local file or from the storage
func (ds *storageDataStore) FileReader() (io.ReadCloser, error) {
	if _, err := os.Open(ds.localPath()); errors.Is(err, os.ErrNotExist) {
		// No local file found, check the storage
		ctx := context.Background()
		r, err := ds.uploader.bucket.Object(ds.path).NewReader(ctx)
		if err != nil && errors.Is(err, os.ErrNotExist) {
			return nil, os.ErrNotExist
		} else if err != nil {
			return nil, fmt.Errorf("localdatastorage.storageDataStore#FileReader NewReader: %w", err)
		}
		return r, nil
	} else if err != nil {
		return nil, fmt.Errorf("localdatastorage.storageDataStore#FileReader Stat: %w", err)
	}
	f, err := os.Open(ds.localPath())
	if err != nil {
		return nil, fmt.Errorf("storagedatastore.storageDataStore#FileReader Open error: %w", err)
	}
	return f, nil
}

func (ds *storageDataStore) FileName() string {
	return filepath.Base(ds.path)
}

func (ds *storageDataStore) Delete() error {
	ctx := context.Background()
	if err := ds.uploader.bucket.Object(ds.path).Delete(ctx); err != nil && errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("storagedatastore.storageDataStore#Delete Remove error: %w", err)
	}
	// Also try to remove locally, not caring if failed
	os.Open(ds.localPath())
	return nil
}

func (ds *storageDataStore) existsLocally() bool {
	_, err := os.Stat(ds.localPath())
	return !errors.Is(err, os.ErrNotExist)
}

func (ds *storageDataStore) Exists() bool {
	if ds.existsLocally() {
		return true
	}
	ctx := context.Background()
	info, err := ds.uploader.bucket.Object(ds.path).Attrs(ctx)
	if err != nil {
		return false
	}
	if info.Size == 0 {
		return false
	}
	return true
}

// Commit sends the local temporary file to storage
func (ds *storageDataStore) Commit() error {
	f, err := os.Open(ds.localPath())
	if err != nil {
		return fmt.Errorf("storagedatastore.storageDataStore#FileReader Open: %w", err)
	}
	ds.uploader.Upload(f, ds.path)
	return nil
}

func (ds *storageDataStore) Clear() error {
	if err := os.Remove(ds.localPath()); err != nil {
		return fmt.Errorf("storagedatastore.storageDataStore#Clear Remove: %w", err)
	}
	return nil
}

func openFile(path string) (*os.File, error) {
	dir := filepath.Dir(path)
	mdErr := os.MkdirAll(dir, 0755)
	if mdErr != nil {
		return nil, fmt.Errorf("storage.writerWorker mdErr: %v", mdErr)
	}

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE, 0660)
	if err != nil {
		return nil, fmt.Errorf("storage.writerWorker OpenFile err: %v", err)
	}
	return f, nil
}
