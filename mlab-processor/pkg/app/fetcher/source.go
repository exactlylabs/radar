package fetcher

import (
	"context"
	"fmt"
	"io"

	gcpstorage "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const mlabBucket = "archive-measurement-lab"

// ObjectSource is the M-Lab archive (a GCS bucket), abstracted for tests.
type ObjectSource interface {
	// List returns all object names under prefix. A partial listing must be an error.
	List(ctx context.Context, prefix string) ([]string, error)
	// Open returns a reader for the object; the caller closes it.
	Open(ctx context.Context, path string) (io.ReadCloser, error)
}

type gcsSource struct {
	client *gcpstorage.Client
	bucket string
}

// NewMLabSource returns an anonymous client for M-Lab's public archive bucket.
func NewMLabSource(ctx context.Context) (ObjectSource, io.Closer, error) {
	client, err := gcpstorage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		return nil, nil, fmt.Errorf("fetcher.NewMLabSource: %w", err)
	}
	return &gcsSource{client: client, bucket: mlabBucket}, client, nil
}

func (g *gcsSource) List(ctx context.Context, prefix string) ([]string, error) {
	var names []string
	it := g.client.Bucket(g.bucket).Objects(ctx, &gcpstorage.Query{Prefix: prefix})
	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			return names, nil
		}
		if err != nil {
			return nil, err
		}
		names = append(names, attrs.Name)
	}
}

func (g *gcsSource) Open(ctx context.Context, path string) (io.ReadCloser, error) {
	return g.client.Bucket(g.bucket).Object(path).NewReader(ctx)
}
