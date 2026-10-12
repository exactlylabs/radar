package datastore

import (
	"io"
	"reflect"

	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

type RowIterator struct {
	decoder   encoders.FileDecoder
	prototype reflect.Type
	nextIndex int64
	closer    io.Closer
}

// NewIterator returns an iterator over decoder's rows; closer (may be nil) is closed by Close.
func NewIterator(decoder encoders.FileDecoder, obj any, closer io.Closer) *RowIterator {
	prototype := reflect.TypeOf(obj)
	if prototype.Kind() == reflect.Ptr {
		prototype = prototype.Elem()
	}
	return &RowIterator{
		decoder:   decoder,
		prototype: prototype,
		closer:    closer,
	}
}

// Err returns the error that ended the iteration early, if any.
func (ri *RowIterator) Err() error {
	return ri.decoder.Err()
}

func (ri *RowIterator) Close() error {
	if ri.closer == nil {
		return nil
	}
	err := ri.closer.Close()
	ri.closer = nil
	return err
}

func (ri *RowIterator) Next() bool {
	return ri.decoder.MoveNext()
}

func (ri *RowIterator) GetRow() (any, error) {
	obj := reflect.New(ri.prototype).Interface()
	err := ri.decoder.DecodeItem(obj)
	if err != nil {
		return nil, err
	}
	ri.nextIndex++
	return obj, nil
}
