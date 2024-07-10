package gcpstorage

import (
	"context"
	"fmt"
	"io"

	"cloud.google.com/go/storage"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor"
	"google.golang.org/api/iterator"
)

type gcpStorage struct {
	bucket *storage.BucketHandle
	cli    *storage.Client
}

func New(ctx context.Context, bucketName string) (ingestor.Storage, error) {
	cli, err := storage.NewClient(ctx)
	if err != nil {
		return nil, errors.W(err)
	}
	bucket := cli.Bucket(bucketName)
	return &gcpStorage{bucket, cli}, nil
}

// List implements ingestor.Storage.
func (g *gcpStorage) List(ctx context.Context, prefix string) ([]string, error) {
	files := make([]string, 0)
	iter := g.bucket.Objects(ctx, &storage.Query{Prefix: prefix})
	for item, err := iter.Next(); item != nil || err != nil; item, err = iter.Next() {
		if err != nil && err == iterator.Done {
			break

		} else if err != nil {
			return nil, fmt.Errorf("ingestor.Fetch Next: %w", err)
		}
		files = append(files, item.Name)
	}
	return files, nil
}

// Read implements ingestor.Storage.
func (g *gcpStorage) Read(ctx context.Context, path string) (io.ReadCloser, error) {
	r, err := g.bucket.Object(path).NewReader(ctx)
	if err != nil {
		return nil, errors.W(err)
	}
	return r, nil
}

func (g *gcpStorage) Close() error {
	return g.cli.Close()
}
