package localstorage

import (
	"context"
	"io"
	"os"
	"path"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
)

type localStorage struct {
	baseDir string
}

func New(dir string) (datastore.Storage, error) {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		os.Mkdir(dir, 0755)
	} else if err != nil {
		return nil, errors.W(err)
	}
	return &localStorage{
		baseDir: dir,
	}, nil
}

func (l *localStorage) List(ctx context.Context, prefix string) ([]string, error) {
	panic("not implemented")
}

func (l *localStorage) Delete(ctx context.Context, filepath string) error {
	return os.Remove(l.mountFilePath(filepath))
}

// Exists implements datastore.Storage.
func (l *localStorage) Exists(ctx context.Context, filepath string) (bool, error) {
	if _, err := os.Stat(l.mountFilePath(filepath)); os.IsNotExist(err) {
		return false, nil
	} else if err != nil {
		return false, errors.W(err)
	}
	return true, nil
}

// Get implements datastore.Storage.
func (l *localStorage) Get(ctx context.Context, filepath string) (io.ReadCloser, error) {
	return os.Open(l.mountFilePath(filepath))
}

// Store implements datastore.Storage.
func (l *localStorage) Store(ctx context.Context, reader io.ReadCloser, filepath string) error {
	defer reader.Close()
	os.MkdirAll(path.Dir(l.mountFilePath(filepath)), 0755)
	file, err := os.Create(l.mountFilePath(filepath))
	if err != nil {
		return errors.W(err)
	}
	defer file.Close()
	if _, err := io.Copy(file, reader); err != nil {
		return errors.W(err)
	}
	return nil
}

func (l *localStorage) Close() error {
	return nil
}

func (l *localStorage) mountFilePath(filepath string) string {
	return path.Join(l.baseDir, filepath)
}
