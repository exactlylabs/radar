package gcpdatastore

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

// gcpDataStore implements datastore.DataStore interface, storing data in in GCP Storage
type gcpDataStore struct {
	encoderProvider encoders.ItemEncoderFactory
	decoderProvider encoders.ItemDecoderFactory
	path            string
	obj             any
	uploader        *Uploader
	ongoingFiles    map[string]bool
}

func New(uploader *Uploader, path string, encoderProvider encoders.ItemEncoderFactory, decoderProvider encoders.ItemDecoderFactory, obj any) (datastore.DataStore, error) {
	return &gcpDataStore{
		encoderProvider: encoderProvider,
		decoderProvider: decoderProvider,
		path:            path,
		obj:             obj,
		uploader:        uploader,
		ongoingFiles:    make(map[string]bool),
	}, nil
}

func (ds *gcpDataStore) localPath() string {
	return filepath.Join("./output", ds.path)
}

// ItemWriter returns a writer that stores locally. The upload happens only when commit
func (ds *gcpDataStore) ItemWriter() (datastore.ItemWriter, error) {
	file, err := openFile(ds.localPath())
	if err != nil {
		return nil, fmt.Errorf("gcpdatastore.gcpDataStore#ItemWriter openFile: %w", err)
	}
	encoder, err := ds.encoderProvider(file)
	if err != nil {
		return nil, fmt.Errorf("gcpdatastore.gcpDataStore#ItemWriter encoderProvider: %w", err)
	}
	writer := newItemWriter(file, encoder)
	return writer, nil
}

// ItemsReader checks if the file exists locally and returns it, otherwise, it  retrieve from storage
func (ds *gcpDataStore) ItemsReader() (datastore.StoreItemIterator, error) {
	f, err := ds.FileReader()
	if err != nil {
		return nil, fmt.Errorf("gcpdatastore.gcpDataStore#ItemsReader FileReader: %w", err)
	}
	decoder, err := ds.decoderProvider(f)
	if err != nil {
		return nil, fmt.Errorf("gcpdatastore.gcpDataStore#Read decoderProvider: %w", err)
	}
	it := datastore.NewIterator(decoder, ds.obj)
	return it, nil
}

// FileReader obtains the object either from a temporary local file or from the storage
func (ds *gcpDataStore) FileReader() (io.ReadCloser, error) {
	if _, err := os.Open(ds.localPath()); errors.Is(err, os.ErrNotExist) {
		// No local file found, check the storage
		ctx := context.Background()
		r, err := ds.uploader.bucket.Object(ds.path).NewReader(ctx)
		if err != nil && errors.Is(err, os.ErrNotExist) {
			return nil, os.ErrNotExist
		} else if err != nil {
			return nil, fmt.Errorf("gcpdatastore.gcpDataStore#FileReader NewReader: %w", err)
		}
		return r, nil
	} else if err != nil {
		return nil, fmt.Errorf("gcpdatastore.gcpDataStore#FileReader Stat: %w", err)
	}
	f, err := os.Open(ds.localPath())
	if err != nil {
		return nil, fmt.Errorf("gcpdatastore.gcpDataStore#FileReader Open: %w", err)
	}
	return f, nil
}

func (ds *gcpDataStore) FileName() string {
	return filepath.Base(ds.path)
}

func (ds *gcpDataStore) Delete() error {
	ctx := context.Background()
	if err := ds.uploader.bucket.Object(ds.path).Delete(ctx); err != nil && errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("gcpdatastore.gcpDataStore#Delete Remove: %w", err)
	}
	// Also try to remove locally, not caring if failed
	os.Open(ds.localPath())
	return nil
}

func (ds *gcpDataStore) existsLocally() bool {
	_, err := os.Stat(ds.localPath())
	return !errors.Is(err, os.ErrNotExist)
}

func (ds *gcpDataStore) Exists() bool {
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

// Flush sends the local temporary file to storage
func (ds *gcpDataStore) Flush() error {
	f, err := os.Open(ds.localPath())
	if err != nil {
		return fmt.Errorf("gcpdatastore.gcpDataStore#FileReader Open: %w", err)
	}
	ds.uploader.Upload(f, ds.path)
	return nil
}

func (ds *gcpDataStore) Clear() error {
	if err := os.Remove(ds.localPath()); err != nil {
		return fmt.Errorf("gcpdatastore.gcpDataStore#Clear Remove: %w", err)
	}
	return nil
}

func openFile(path string) (*os.File, error) {
	dir := filepath.Dir(path)
	mdErr := os.MkdirAll(dir, 0755)
	if mdErr != nil {
		return nil, fmt.Errorf("gcpdatastore.openFile mdErr: %v", mdErr)
	}

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0660)
	if err != nil {
		return nil, fmt.Errorf("gcpdatastore.openFile OpenFile: %v", err)
	}
	return f, nil
}
