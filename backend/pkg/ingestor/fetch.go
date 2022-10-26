package ingestor

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	gcpstorage "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

type ItemIterator struct {
	names  [][]string
	bucket *gcpstorage.BucketHandle
	index  int
}

func (it *ItemIterator) Next() ([]io.ReadCloser, error) {
	if it.index >= len(it.names) {
		return nil, nil
	}
	ctx := context.Background()
	readers := make([]io.ReadCloser, 0)
	log.Println("Reading", it.names[it.index])
	for _, path := range it.names[it.index] {
		r, err := it.bucket.Object(path).NewReader(ctx)
		if err != nil {
			return nil, fmt.Errorf("fetch.ItemIterator#PreFetch NewReader: %w", err)
		}
		readers = append(readers, r)
	}

	it.index++
	return readers, nil
}

// Fetch avro files, returning an iterator of files
func Fetch(bucket string, directories []string, start, end time.Time) (*ItemIterator, error) {
	ctx := context.Background()
	client, err := gcpstorage.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("ingestor.Fetch NewClient: %w", err)
	}
	log.Printf("Fetching files to download for bucket %v\n from %v to %v", bucket, start, end)
	names := make([][]string, 0)
	// Iterate through dates and add them to be added into the database
	for date := start; date.Before(end); date = date.AddDate(0, 0, 1) {
		dateStr := date.Format("2006-01-02")
		dateNames := make([]string, 0)
		for _, directory := range directories {
			prefix := dateStr
			if directory != "" {
				prefix = fmt.Sprintf("%s/%s", directory, prefix)
			}
			iter := client.Bucket(bucket).Objects(ctx, &gcpstorage.Query{Prefix: prefix})
			for item, err := iter.Next(); item != nil || err != nil; item, err = iter.Next() {
				if err != nil && err == iterator.Done {
					break

				} else if err != nil {
					return nil, fmt.Errorf("ingestor.Fetch Next: %w", err)
				}
				dateNames = append(dateNames, item.Name)
			}
		}
		if len(dateNames) == len(directories) {
			names = append(names, dateNames)
		}
	}
	return &ItemIterator{
		names:  names,
		bucket: client.Bucket(bucket),
	}, nil
}
