package ingestor

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

// itemIterator provides sequential access to groups of files organized by date.
// Each iteration returns all files for a specific date, allowing batch processing
// of related measurement data files.
type itemIterator struct {
	// names contains groups of file paths, where each group represents files from the same date
	names [][]string
	// storage is the backend storage interface used to read the files
	storage Storage
	// index tracks the current position in the names slice
	index int
}

// Next returns the next group of file readers for a specific date.
// It returns nil when all files have been processed.
// The caller is responsible for closing all returned readers.
func (it *itemIterator) Next() ([]io.ReadCloser, error) {
	if it.index >= len(it.names) {
		return nil, nil
	}
	ctx := context.Background()
	readers := make([]io.ReadCloser, 0)
	log.Println("Reading", it.names[it.index])
	for _, path := range it.names[it.index] {
		r, err := it.storage.Read(ctx, path)
		if err != nil {
			return nil, errors.Wrap(err, "failed to read file")
		}
		readers = append(readers, r)
	}

	it.index++
	return readers, nil
}

// Fetch retrieves AVRO files from the specified storage within the given time range.
// It searches multiple directories and groups files by date for efficient batch processing.
//
// Parameters:
//   - storage: The storage backend to fetch files from
//   - directories: List of directory paths to search for files
//   - start: Start date (inclusive) for the file search
//   - end: End date (exclusive) for the file search
//
// Returns:
//   - An itemIterator for sequential access to the files, or nil if no files are found
//   - An error if the listing operation fails
//
// The function expects files to be organized by date with the naming pattern: [directory/]YYYY-MM-DD*
func Fetch(storage Storage, directories []string, start, end time.Time) (*itemIterator, error) {
	// Validate inputs
	if storage == nil {
		return nil, errors.New("storage cannot be nil")
	}
	if start.After(end) || start.Equal(end) {
		return nil, errors.New("start time must be before end time")
	}

	ctx := context.Background()
	log.Printf("Fetching files to download for storage %v\n from %v to %v", storage, start, end)

	names := make([][]string, 0)

	// Normalize start date to beginning of day for consistent iteration
	currentDate := start.Truncate(time.Hour * 24)
	endDate := end.Truncate(time.Hour * 24)

	// Iterate through each day in the date range
	for !currentDate.After(endDate) && currentDate.Before(end) {
		// Format date for file path construction
		dateStr := currentDate.Format("2006-01-02")
		dateNames := make([]string, 0)

		// Search for files in each specified directory
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
		// Only include this date if we found files in all directories
		if len(dateNames) == len(directories) {
			names = append(names, dateNames)
		}

		// Move to next day
		currentDate = currentDate.AddDate(0, 0, 1)
	}
	if len(names) == 0 {
		return nil, nil
	}
	return &itemIterator{
		names:   names,
		storage: storage,
	}, nil
}
