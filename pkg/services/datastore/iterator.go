package datastore

import (
	"reflect"

	"github.com/exactlylabs/mlab-processor/pkg/services/encoders"
)

type RowIterator struct {
	decoder   encoders.FileDecoder
	prototype reflect.Type
	nextIndex int64
}

func NewIterator(decoder encoders.FileDecoder, obj any) *RowIterator {
	prototype := reflect.TypeOf(obj)
	if prototype.Kind() == reflect.Ptr {
		prototype = prototype.Elem()
	}
	return &RowIterator{
		decoder:   decoder,
		prototype: prototype,
	}
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
