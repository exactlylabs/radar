package storage

import (
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"sync"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
	"github.com/xitongsys/parquet-go-source/local"
	"github.com/xitongsys/parquet-go/parquet"
	"github.com/xitongsys/parquet-go/writer"

	"github.com/hamba/avro"
	"github.com/hamba/avro/ocf"
)

//var channelWriters = map[string]chan interface{}{}
var channelWriters = sync.Map{}
var wg = &sync.WaitGroup{}

type RowIterator struct {
	decoder   *ocf.Decoder
	objType   reflect.Type
	nextIndex int64
}

func (i *RowIterator) Next() interface{} {
	if i.decoder == nil || !i.decoder.HasNext() {
		return nil
	}

	// Generate a new empty instance of the objType
	obj := reflect.New(i.objType.Elem()).Interface()
	rErr := i.decoder.Decode(obj)
	if rErr != nil {
		panic(fmt.Errorf("RowIterator#Next rErr: %v", rErr))
	}

	i.nextIndex++

	return obj
}

func DatedRows(store string, obj interface{}, date time.Time) *RowIterator {
	path := fmt.Sprintf("output/%v/%v.avro", store, date.Format("2006-01-02"))

	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return &RowIterator{
			decoder:   nil,
			objType:   reflect.TypeOf(obj),
			nextIndex: 0,
		}
	}

	f, err := os.Open(path)
	if err != nil {
		panic(fmt.Errorf("storage.DatedRows err: %v", err))
	}

	decoder, err := ocf.NewDecoder(f)
	if err != nil {
		log.Panicf("storage.DatedRows new decoder err: %v", err)
	}

	return &RowIterator{
		decoder:   decoder,
		objType:   reflect.TypeOf(obj),
		nextIndex: 0,
	}
}

func channelKey(store string, date time.Time) string {
	return fmt.Sprintf("%s-%s", store, date.Format("2006-01-02"))
}

func writeParquetWorker(filePath string, obj interface{}, ch chan interface{}) {
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

func writeAvroWorker(filePath string, schema avro.Schema, ch chan interface{}) {
	defer wg.Done()

	dir := filepath.Dir(filePath)
	mdErr := os.MkdirAll(dir, 0755)
	if mdErr != nil {
		panic(fmt.Errorf("storage.writerWorker mdErr: %v", mdErr))
	}

	f, err := os.OpenFile(filePath, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0660)
	if err != nil {
		panic(fmt.Errorf("storage.writerWorker Open err: %v", err))
	}

	encoder, err := ocf.NewEncoder(
		schema.String(), f,
		ocf.WithCodec(ocf.Snappy),
	)
	if err != nil {
		log.Panicf("storage.writeWorker New Encoder e rr: %v", err)
	}

	total := 0
	for item := range ch {
		func() {
			defer timer.TimeIt(time.Now(), "WriteWorker")
			wErr := encoder.Encode(item)
			if wErr != nil {
				panic(fmt.Errorf("storage.writerWorker wErr: %v", wErr))
			}

		}()
		total++
	}
	if err := encoder.Flush(); err != nil {
		log.Panicf("storage.writeWorker flush err: %v", err)
	}
	if err := f.Sync(); err != nil {
		log.Panicf("storage.writeWorker sync err: %v", err)
	}
	cErr := f.Close()
	if cErr != nil {
		panic(fmt.Errorf("storage.writerWorker cErr: %v", cErr))
	}
}

func getStoreSchema(store string) avro.Schema {
	var schema string

	switch store {
	case "fetched":
		schema = "pkg/app/models/fetchedresult.avsc"
	case "geocode":
		schema = "pkg/app/models/geocodedresult.avsc"
	case "reverse":
		schema = "pkg/app/models/revgeoresult.avsc"
	default:
		schema = ""
	}

	if schema != "" {
		file, err := os.Open(schema)
		if err != nil {
			log.Panicf("storage.getStoreSchema openErr: %v", err)
		}
		data, err := io.ReadAll(file)
		if err != nil {
			log.Panicf("storage.getStoreSchema readErr: %v", err)
		}
		return avro.MustParse(string(data))
	}
	panic(fmt.Errorf("storage.getStoreSchema err: Avro schema not found for %v", store))
}

// PushDatedRow send a row to the worker responsible of writing it in a parquet file of a specific date
// in case the worker/file doesn't exist yet, it starts a new goroutine to handle the writing.
func PushDatedRow(store string, date time.Time, row interface{}) {
	key := channelKey(store, date)
	if _, ok := channelWriters.Load(key); !ok {
		ch := make(chan interface{})
		channelWriters.Store(key, ch)
		wg.Add(1)
		schema := getStoreSchema(store)
		go writeAvroWorker(fmt.Sprintf("output/%v/%v.avro", store, date.Format("2006-01-02")), schema, ch)
	}

	chRaw, _ := channelWriters.Load(key)
	ch := chRaw.(chan interface{})

	ch <- row
}

func CloseDatedRow(store string, date time.Time) {
	key := channelKey(store, date)
	chRaw, _ := channelWriters.Load(key)
	if chRaw == nil {
		return
	}

	ch := chRaw.(chan interface{})
	channelWriters.Delete(key)
	if ch != nil {
		close(ch)
	}
}
