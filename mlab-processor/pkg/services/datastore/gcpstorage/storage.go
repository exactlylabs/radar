package gcpstorage

import (
	"context"
	"io"
	"os"

	"cloud.google.com/go/storage"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"google.golang.org/api/iterator"
)

type gcsStorage struct {
	bucketName string
	cli        *storage.Client
}

func New(ctx context.Context, bucketName string) (datastore.Storage, error) {
	cli, err := storage.NewClient(ctx)
	if err != nil {
		return nil, errors.W(err)
	}
	return &gcsStorage{
		bucketName: bucketName,
		cli:        cli,
	}, nil
}

// List implements datastore.Storage.
func (g *gcsStorage) List(ctx context.Context, prefix string) ([]string, error) {
	files := make([]string, 0)
	iter := g.cli.Bucket(g.bucketName).Objects(ctx, &storage.Query{Prefix: prefix})
	for item, err := iter.Next(); item != nil || err != nil; item, err = iter.Next() {
		if err != nil && err == iterator.Done {
			break

		} else if err != nil {
			return nil, errors.W(err)
		}
		files = append(files, item.Name)
	}
	return files, nil
}

// Delete implements datastore.Storage.
func (g *gcsStorage) Delete(ctx context.Context, filepath string) error {
	err := g.cli.Bucket(g.bucketName).Object(filepath).Delete(ctx)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

// Exists implements datastore.Storage.
func (g *gcsStorage) Exists(ctx context.Context, filepath string) (bool, error) {
	info, err := g.cli.Bucket(g.bucketName).Object(filepath).Attrs(ctx)
	if errors.Is(err, storage.ErrObjectNotExist) {
		return false, nil
	} else if err != nil {
		return false, errors.W(err)
	}
	return info.Size > 0, nil
}

// Get implements datastore.Storage.
func (g *gcsStorage) Get(ctx context.Context, filepath string) (io.ReadCloser, error) {
	r, err := g.cli.Bucket(g.bucketName).Object(filepath).NewReader(ctx)
	if errors.Is(err, storage.ErrObjectNotExist) {
		return nil, os.ErrNotExist
	} else if err != nil {
		return nil, errors.W(err)
	}
	return r, nil
}

// Store implements datastore.Storage.
func (g *gcsStorage) Store(ctx context.Context, reader io.ReadSeeker, filepath string) error {
	if _, err := reader.Seek(0, io.SeekStart); err != nil {
		return errors.W(err)
	}
	w := g.cli.Bucket(g.bucketName).Object(filepath).NewWriter(ctx)
	if _, err := io.Copy(w, reader); err != nil {
		w.Close()
		return errors.W(err)
	}
	// The object only becomes visible if Close succeeds
	if err := w.Close(); err != nil {
		return errors.W(err)
	}
	return nil
}

func (g *gcsStorage) Close() error {
	return g.cli.Close()
}
