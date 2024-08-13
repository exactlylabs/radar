package ingestor

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

type ItemIterator struct {
	names   [][]string
	storage Storage
	index   int
}

func (it *ItemIterator) Next() ([]io.ReadCloser, error) {
	if it.index >= len(it.names) {
		return nil, nil
	}
	ctx := context.Background()
	readers := make([]io.ReadCloser, 0)
	log.Println("Reading", it.names[it.index])
	for _, path := range it.names[it.index] {
		r, err := it.storage.Read(ctx, path)
		if err != nil {
			return nil, fmt.Errorf("fetch.ItemIterator#PreFetch NewReader: %w", err)
		}
		readers = append(readers, r)
	}

	it.index++
	return readers, nil
}

// Fetch avro files, returning an iterator of files or nil in case no files are found
func Fetch(storage Storage, directories []string, start, end time.Time) (*ItemIterator, error) {
	ctx := context.Background()
	log.Printf("Fetching files to download for storage %v\n from %v to %v", storage, start, end)
	names := make([][]string, 0)
	// Iterate through dates and add them to be added into the database
	for date := start.Truncate(time.Hour * 24); date.Before(end); date = date.AddDate(0, 0, 1) {
		dateStr := date.Format("2006-01-02")
		dateNames := make([]string, 0)
		for _, directory := range directories {
			prefix := dateStr
			if directory != "" {
				prefix = fmt.Sprintf("%s/%s", directory, prefix)
			}
			var err error
			log.Printf("Listing files with prefix: %s\n", prefix)
			fileNames, err := storage.List(ctx, prefix)
			if err != nil {
				return nil, errors.W(err)
			}
			log.Printf("Found %d files", len(fileNames))
			dateNames = append(dateNames, fileNames...)
		}
		if len(dateNames) == len(directories) {
			names = append(names, dateNames)
		}
	}
	if len(names) == 0 {
		return nil, nil
	}
	return &ItemIterator{
		names:   names,
		storage: storage,
	}, nil
}
