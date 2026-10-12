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
	// Store uploads the whole content of reader to filepath. It must be synchronous and
	// return an error unless the object was stored completely; implementations may seek
	// reader back to the start to retry. The caller closes reader.
	Store(ctx context.Context, reader io.ReadSeeker, filepath string) error
	Get(ctx context.Context, filepath string) (io.ReadCloser, error)
	List(ctx context.Context, prefix string) ([]string, error)
	Delete(ctx context.Context, filepath string) error
	// Exists reports whether filepath exists. It returns (false, nil) only when the
	// storage positively says the object does not exist (e.g. HTTP 404); any other
	// failure is an error, never "not found".
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

// FileWriter creates the local temporary file of the step's output and returns it; the
// caller writes the whole encoded file and closes it. The upload happens on Flush.
func (ds *dataStore) FileWriter() (io.WriteCloser, error) {
	file, err := openFile(ds.localPath())
	if err != nil {
		return nil, errors.W(err)
	}
	return file, nil
}

// ItemsReader checks if the file exists locally and returns it, otherwise, it  retrieve from storage
func (ds *dataStore) ItemsReader() (StoreItemIterator, error) {
	f, err := ds.FileReader()
	if err != nil {
		return nil, errors.W(err)
	}
	decoder, err := ds.decoderProvider(f)
	if err != nil {
		f.Close()
		return nil, errors.W(err)
	}
	it := NewIterator(decoder, ds.obj, f)
	return it, nil
}

// FileReader obtains the object either from a temporary local file or from the storage.
// The caller must close it.
func (ds *dataStore) FileReader() (io.ReadCloser, error) {
	f, err := os.Open(ds.localPath())
	if err == nil {
		return f, nil
	}
	if !errors.Is(err, os.ErrNotExist) {
		return nil, errors.W(err)
	}
	// No local file found, read from the storage
	r, err := ds.storage.Get(context.Background(), ds.path)
	if err != nil && errors.Is(err, os.ErrNotExist) {
		return nil, os.ErrNotExist
	} else if err != nil {
		return nil, errors.W(err)
	}
	return r, nil
}

func (ds *dataStore) FileName() string {
	return filepath.Base(ds.path)
}

func (ds *dataStore) Delete() error {
	ctx := context.Background()
	if err := ds.storage.Delete(ctx, ds.path); err != nil && !errors.Is(err, os.ErrNotExist) {
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

// Exists reports whether the step's output was stored. Only the storage counts: a
// local temporary file may be a leftover of an interrupted run.
func (ds *dataStore) Exists() (bool, error) {
	exists, err := ds.storage.Exists(context.Background(), ds.path)
	if err != nil {
		return false, errors.W(err)
	}
	return exists, nil
}

// Flush sends the local temporary file to storage
func (ds *dataStore) Flush() error {
	f, err := os.Open(ds.localPath())
	if err != nil {
		return errors.W(err)
	}
	defer f.Close()
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
