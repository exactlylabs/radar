package datastore

import (
	"context"
	"io"
	"os"
	"path/filepath"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

// Storage has the logic to which storaging mechanism the data should be recorded to.
type Storage interface {
	Store(ctx context.Context, reader io.ReadCloser, filepath string) error
	Get(ctx context.Context, filepath string) (io.ReadCloser, error)
	List(ctx context.Context, prefix string) ([]string, error)
	Delete(ctx context.Context, filepath string) error
	Exists(ctx context.Context, filepath string) (bool, error)
	Close() error
}

// gcpDataStore implements datastore.DataStore interface, storing data in in GCP Storage
type dataStore struct {
	encoderProvider encoders.ItemEncoderFactory
	decoderProvider encoders.ItemDecoderFactory
	path            string
	obj             any
	storage         Storage
	ongoingFiles    map[string]bool
}

func New(storage Storage, path string, encoderProvider encoders.ItemEncoderFactory, decoderProvider encoders.ItemDecoderFactory, obj any) (DataStore, error) {
	return &dataStore{
		encoderProvider: encoderProvider,
		decoderProvider: decoderProvider,
		path:            path,
		obj:             obj,
		storage:         storage,
		ongoingFiles:    make(map[string]bool),
	}, nil
}

func (ds *dataStore) localPath() string {
	return filepath.Join("./output", ds.path)
}

// ItemWriter returns a writer that stores locally. The upload happens only when commit
func (ds *dataStore) ItemWriter() (ItemWriter, error) {
	file, err := openFile(ds.localPath())
	if err != nil {
		return nil, errors.W(err)
	}
	encoder, err := ds.encoderProvider(file)
	if err != nil {
		return nil, errors.W(err)
	}
	writer := NewItemWriter(file, encoder)
	return writer, nil
}

// ItemsReader checks if the file exists locally and returns it, otherwise, it  retrieve from storage
func (ds *dataStore) ItemsReader() (StoreItemIterator, error) {
	f, err := ds.FileReader()
	if err != nil {
		return nil, errors.W(err)
	}
	decoder, err := ds.decoderProvider(f)
	if err != nil {
		return nil, errors.W(err)
	}
	it := NewIterator(decoder, ds.obj)
	return it, nil
}

// FileReader obtains the object either from a temporary local file or from the storage
func (ds *dataStore) FileReader() (io.ReadCloser, error) {
	if _, err := os.Open(ds.localPath()); errors.Is(err, os.ErrNotExist) {
		// No local file found, check the storage
		ctx := context.Background()

		// r, err := ds.uploader.bucket.Object(ds.path).NewReader(ctx)
		r, err := ds.storage.Get(ctx, ds.path)
		if err != nil && errors.Is(err, os.ErrNotExist) {
			return nil, os.ErrNotExist
		} else if err != nil {
			return nil, errors.W(err)
		}
		return r, nil
	} else if err != nil {
		return nil, errors.W(err)
	}
	f, err := os.Open(ds.localPath())
	if err != nil {
		return nil, errors.W(err)
	}
	return f, nil
}

func (ds *dataStore) FileName() string {
	return filepath.Base(ds.path)
}

func (ds *dataStore) Delete() error {
	ctx := context.Background()
	if err := ds.storage.Delete(ctx, ds.path); err != nil && errors.Is(err, os.ErrNotExist) {
		return errors.W(err)
	}
	// Also try to remove locally, not caring if failed
	os.Remove(ds.localPath())
	return nil
}

func (ds *dataStore) existsLocally() bool {
	_, err := os.Stat(ds.localPath())
	return !errors.Is(err, os.ErrNotExist)
}

func (ds *dataStore) Exists() bool {
	if ds.existsLocally() {
		return true
	}
	ctx := context.Background()
	exists, err := ds.storage.Exists(ctx, ds.path)
	if err != nil {
		return false
	}
	return exists
}

// Flush sends the local temporary file to storage
func (ds *dataStore) Flush() error {
	f, err := os.Open(ds.localPath())
	if err != nil {
		return errors.W(err)
	}
	err = ds.storage.Store(context.Background(), f, ds.path)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (ds *dataStore) Clear() error {
	if !ds.existsLocally() {
		return nil
	}
	if err := os.Remove(ds.localPath()); err != nil {
		return errors.W(err)
	}
	return nil
}

func openFile(path string) (*os.File, error) {
	dir := filepath.Dir(path)
	mdErr := os.MkdirAll(dir, 0755)
	if mdErr != nil {
		return nil, errors.W(mdErr)
	}

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0660)
	if err != nil {
		return nil, errors.W(err)
	}
	return f, nil
}
