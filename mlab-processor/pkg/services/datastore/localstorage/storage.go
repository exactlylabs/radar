package localstorage

import (
	"context"
	"io"
	"os"
	"path"
	"path/filepath"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
)

type localStorage struct {
	baseDir string
}

func New(dir string) (datastore.Storage, error) {
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, errors.W(err)
	}
	return &localStorage{
		baseDir: dir,
	}, nil
}

func (l *localStorage) List(ctx context.Context, prefix string) ([]string, error) {
	var files []string
	dir := l.mountFilePath(path.Dir(prefix + "x"))
	entries, err := os.ReadDir(dir)
	if errors.Is(err, os.ErrNotExist) {
		return files, nil
	} else if err != nil {
		return nil, errors.W(err)
	}
	for _, e := range entries {
		rel := path.Join(path.Dir(prefix+"x"), e.Name())
		if !e.IsDir() && len(rel) >= len(prefix) && rel[:len(prefix)] == prefix {
			files = append(files, rel)
		}
	}
	return files, nil
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

// Store implements datastore.Storage. The file appears atomically (temp file + rename),
// so an interrupted copy never looks like a finished object.
func (l *localStorage) Store(ctx context.Context, reader io.ReadSeeker, dst string) error {
	target := l.mountFilePath(dst)
	if err := os.MkdirAll(path.Dir(target), 0755); err != nil {
		return errors.W(err)
	}
	if _, err := reader.Seek(0, io.SeekStart); err != nil {
		return errors.W(err)
	}
	tmp, err := os.CreateTemp(filepath.Dir(target), "."+filepath.Base(target)+".tmp-*")
	if err != nil {
		return errors.W(err)
	}
	defer os.Remove(tmp.Name())
	if _, err := io.Copy(tmp, reader); err != nil {
		tmp.Close()
		return errors.W(err)
	}
	if err := tmp.Close(); err != nil {
		return errors.W(err)
	}
	if err := os.Rename(tmp.Name(), target); err != nil {
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
