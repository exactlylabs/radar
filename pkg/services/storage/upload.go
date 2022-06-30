package storage

import (
	"context"
	"fmt"
	"io"
	"os"

	gcpstorage "cloud.google.com/go/storage"
	gcpopt "google.golang.org/api/option"
)

var buckets map[string]string
var storageOpts []gcpopt.ClientOption

// ConfigureUpload enables uploading files to a cloud Storage
func ConfigureUpload(b map[string]string, opts ...gcpopt.ClientOption) {
	buckets = b
	storageOpts = opts
}

func UploadProcessedFile(store, src, dst string) {
	if bucketName, exists := buckets[store]; exists {
		f, err := os.Open(src)
		if err != nil {
			panic(fmt.Errorf("error opening file for uploading: %w", err))
		}
		ctx := context.Background()
		storage, err := gcpstorage.NewClient(ctx, storageOpts...)
		if err != nil {
			panic(fmt.Errorf("error creating gcp storage client: %w", err))
		}
		obj := storage.Bucket(bucketName).Object(dst)
		objWriter := obj.NewWriter(ctx)

		_, err = io.Copy(objWriter, f)
		if err != nil {
			panic(fmt.Errorf("error uploading file to storage: %w", err))
		}
		if err := objWriter.Close(); err != nil {
			panic(fmt.Errorf("error closing file writer: %w", err))
		}
	}
}
