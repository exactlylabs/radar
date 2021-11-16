package storage

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"sync"
	"time"

	"github.com/xitongsys/parquet-go-source/local"
	"github.com/xitongsys/parquet-go/parquet"
	"github.com/xitongsys/parquet-go/reader"
	"github.com/xitongsys/parquet-go/source"
	"github.com/xitongsys/parquet-go/writer"
)

var channelWriters = map[string]chan interface{}{}
var wg = &sync.WaitGroup{}

type RowIterator struct {
	fr        source.ParquetFile
	pr        *reader.ParquetReader
	objType   reflect.Type
	nextIndex int64
	totalRows int64
}

func (i *RowIterator) Next() interface{} {
	if i.fr == nil {
		return nil
	}

	if i.nextIndex >= i.totalRows {
		i.pr.ReadStop()
		err := i.fr.Close()
		if err != nil {
			panic(fmt.Errorf("RowIterator#Next err: %v", err))
		}

		return nil
	}

	sliceType := reflect.SliceOf(i.objType.Elem())
	slicePtr := reflect.New(sliceType)
	slice := reflect.MakeSlice(sliceType, 1, 1)
	slicePtr.Elem().Set(slice)
	slicePtrInterface := slicePtr.Interface()
	rErr := i.pr.Read(slicePtrInterface)
	if rErr != nil {
		panic(fmt.Errorf("RowIterator#Next rErr: %v", rErr))
	}

	i.nextIndex++

	instPtr := reflect.New(i.objType.Elem())
	instPtr.Elem().Set(slice.Index(0))

	return instPtr.Interface()
}

func DatedRows(store string, obj interface{}, date time.Time) *RowIterator {
	path := fmt.Sprintf("output/%v/%v.parquet", store, date.Format("2006-01-02"))

	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return &RowIterator{
			fr:        nil,
			pr:        nil,
			objType:   reflect.TypeOf(obj),
			nextIndex: 0,
			totalRows: 0,
		}
	}

	fr, err := local.NewLocalFileReader(path)
	if err != nil {
		panic(fmt.Errorf("storage.DatedRows err: %v", err))
	}

	pr, rErr := reader.NewParquetReader(fr, obj, 4)
	if rErr != nil {
		panic(fmt.Errorf("storage.DatedRows rErr: %v", rErr))
	}

	return &RowIterator{
		fr:        fr,
		pr:        pr,
		objType:   reflect.TypeOf(obj),
		nextIndex: 0,
		totalRows: pr.GetNumRows(),
	}
}

func channelKey(store string, date time.Time) string {
	return fmt.Sprintf("%s-%s", store, date.Format("2006-01-02"))
}

func writerWorker(filePath string, obj interface{}, ch chan interface{}) {
	defer wg.Done()

	dir := filepath.Dir(filePath)
	mdErr := os.MkdirAll(dir, 0755)
	if mdErr != nil {
		panic(fmt.Errorf("storage.writerWorker mdErr: %v", mdErr))
	}

	fw, lErr := local.NewLocalFileWriter(filePath)
	if lErr != nil {
		panic(fmt.Errorf("storage.writerWorker lErr: %v", lErr))
	}

	pw, err := writer.NewParquetWriter(fw, obj, 4)
	if err != nil {
		panic(fmt.Errorf("storage.writerWorker err: %v", err))
	}

	pw.CompressionType = parquet.CompressionCodec_SNAPPY

	for item := range ch {
		wErr := pw.Write(item)
		if wErr != nil {
			panic(fmt.Errorf("storage.writerWorker wErr: %v", wErr))
		}
	}

	if sErr := pw.WriteStop(); sErr != nil {
		panic(fmt.Errorf("storage.writerWorker sErr: %v", sErr))
	}

	cErr := fw.Close()
	if cErr != nil {
		panic(fmt.Errorf("storage.writerWorker cErr: %v", cErr))
	}
}

func PushDatedRow(store string, date time.Time, row interface{}) {
	key := channelKey(store, date)
	if _, ok := channelWriters[key]; !ok {
		channelWriters[key] = make(chan interface{})
		wg.Add(1)
		go writerWorker(fmt.Sprintf("output/%v/%v.parquet", store, date.Format("2006-01-02")), row, channelWriters[key])
	}

	channelWriters[key] <- row
}

func CloseDatedRow(store string, date time.Time) {
	key := channelKey(store, date)
	ch := channelWriters[key]
	delete(channelWriters, key)
	if ch != nil {
		close(ch)
	}
}
