package storage

import "time"

type RowIterator struct{}

func (i *RowIterator) Next() interface{} {
	return nil
}

func DatedRows(store string, date time.Time) *RowIterator {
	return &RowIterator{}
}

func PushDatedRow(store string, date time.Time, row interface{}) {

}
