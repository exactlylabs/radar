package blob

import (
	"context"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
)

type GCPStorer struct{}

var client *storage.Client
var bucketName = os.Getenv("GCP_BUCKET")

func init() {
	var err error
	absPath, err := filepath.Abs(os.Getenv("GCP_CREDENTIALS_RELATIVE"))
	if err != nil {
		panic(fmt.Errorf("failed to resolve GCP_CREDENTIALS_RELATIVE: %w", err))
	}
	os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", absPath)
	client, err = storage.NewClient(context.Background())
	if err != nil {
		panic(fmt.Errorf("failed to create gcp client: %w", err))
	}
}

func (ls *GCPStorer) Upload(name string, contentType string, srcFile io.ReadSeeker) (string, error) {
	ctx := context.Background()

	entityId := uuid.New()
	entityExt := path.Ext(name)
	entityName := entityId.String() + entityExt

	// Upload an object with storage.Writer.
	wc := client.Bucket(bucketName).Object(entityName).NewWriter(ctx)
	if _, err := io.Copy(wc, srcFile); err != nil {
		return "", fmt.Errorf("io.Copy: %v", err)
	}
	if err := wc.Close(); err != nil {
		return "", fmt.Errorf("Writer.Close: %v", err)
	}

	return entityName, nil
}

func (ls *GCPStorer) Fetch(name string) (io.ReadCloser, string, error) {
	ctx := context.Background()

	obj := client.Bucket(bucketName).Object(name)
	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return nil, "", fmt.Errorf("Fetch: unable to get attrs from bucket %q, file %q: %w", bucketName, name, err)
	}

	rc, err := client.Bucket(bucketName).Object(name).NewReader(ctx)
	if err != nil {
		return nil, "", fmt.Errorf("Fetch: unable to open file from bucket %q, file %q: %w", bucketName, name, err)
	}

	return rc, attrs.ContentType, nil
}
