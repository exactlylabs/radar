package datastore

import (
	"io"
)

// ItemWriter knows how to write an encoded item into the DataStore
type ItemWriter interface {
	// Write should encode the given item
	// and write it to the DataStore filesystem
	Write(item any) error
	// Close should do things such as Flushing and Closing the file
	Close() error
}

// StoreItemIterator retrieves the items from the DataStore
// one at a time
type StoreItemIterator interface {
	// Next moves the cursor to the next item. It should always be called before calling GetRow.
	// It returns true if a new value is available or false when it reaches the end.
	// In case of an error, it should return true, so GetRow can retrieve the error
	Next() bool
	// GetRow retrieves the item of the current cursor's row
	GetRow() (any, error)
}

// DataStore manages storing encoded items (rows) in a specific filesystem for a single date file
type DataStore interface {
	// ItemWriter returns an implementation of ItemWriter interface
	ItemWriter() (ItemWriter, error)
	// ItemsReader returns an implementation of a StoreItemIterator
	ItemsReader() (StoreItemIterator, error)
	// FileReader returns an io.ReadCloser that reads the bytes from the file
	FileReader() (io.ReadCloser, error)
	// FileName returns the name of the file in the filesystem
	FileName() string
	// Delete the file in the filesystem
	Delete() error
	// Exists returns whether the file exists in the filesystem
	Exists() bool
	// Flush should be called after you finish writing to the file.
	// Things such as moving from a temporary location to a final destination should be placed here
	Flush() error
	// Clear removes any temporary files that might exist
	Clear() error
}
