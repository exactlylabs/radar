package ingestor

import (
	"context"
	"io"
)

type Storage interface {
	Read(ctx context.Context, path string) (io.ReadCloser, error)
	List(ctx context.Context, prefix string) ([]string, error)
	Close() error
}
