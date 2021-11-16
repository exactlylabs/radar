package storage

import (
	"errors"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/xitongsys/parquet-go-source/local"
	"github.com/xitongsys/parquet-go/parquet"
	"github.com/xitongsys/parquet-go/reader"
	"github.com/xitongsys/parquet-go/writer"
)

type JobIndex struct {
	Store       string `parquet:"name=id, type=BYTE_ARRAY"`
	Date        int64  `parquet:"name=date, type=INT64"`
	CompletedAt int64  `parquet:"name=completed_at, type=INT64"`
}

var storeCompleted = sync.Map{}

func init() {
	if _, err := os.Stat("output/index.parquet"); errors.Is(err, os.ErrNotExist) {
		return
	}

	fr, err := local.NewLocalFileReader("output/index.parquet")
	if err != nil {
		panic(fmt.Errorf("storage.init err: %v", err))
	}

	pr, rErr := reader.NewParquetReader(fr, &JobIndex{}, 4)
	if rErr != nil {
		panic(fmt.Errorf("storage.init rErr: %v", rErr))
	}

	totalRows := pr.GetNumRows()
	for i := int64(0); i < totalRows; i++ {
		row := make([]JobIndex, 1)
		rrErr := pr.Read(&row)
		date := time.Unix(row[0].Date, 0).UTC()
		fmt.Println("LOADING", row[0].Store+date.Format("2006-01-02"))
		storeCompleted.Store(row[0].Store+date.Format("2006-01-02"), &row[0])
		if rrErr != nil {
			panic(fmt.Errorf("storage.init rrErr: %v", rrErr))
		}
	}

	pr.ReadStop()
	cErr := fr.Close()
	if cErr != nil {
		panic(fmt.Errorf("storage.init cErr: %v", cErr))
	}
}

func MarkCompleted(store string, date time.Time) {
	fmt.Println("MARKING", store+date.Format("2006-01-02"))
	storeCompleted.Store(store+date.Format("2006-01-02"), &JobIndex{
		Store:       store,
		Date:        date.Unix(),
		CompletedAt: time.Now().Unix(),
	})
}

func dateRange(start, end time.Time) (dates []time.Time) {
	dates = []time.Time{}
	for t := start; t.Before(end.AddDate(0, 0, 1)); t = t.AddDate(0, 0, 1) {
		dates = append(dates, t)
	}
	return dates
}

func Incomplete(store string, startDate time.Time, endDate time.Time) []time.Time {
	dateRange := dateRange(startDate, endDate)

	datesToRun := []time.Time{}

	for _, date := range dateRange {
		fmt.Println(store + date.Format("2006-01-02"))
		if _, ok := storeCompleted.Load(store + date.Format("2006-01-02")); !ok {
			fmt.Println("ADDING", store+date.Format("2006-01-02"))
			datesToRun = append(datesToRun, date)
		}
	}

	return datesToRun
}

func persistJobs() {
	mdErr := os.MkdirAll("output", 0755)
	if mdErr != nil {
		panic(fmt.Errorf("storage.persistJobs mdErr: %v", mdErr))
	}

	fw, lErr := local.NewLocalFileWriter("output/index.parquet")
	if lErr != nil {
		panic(fmt.Errorf("storage.persistJobs lErr: %v", lErr))
	}

	pw, err := writer.NewParquetWriter(fw, &JobIndex{}, 4)
	if err != nil {
		panic(fmt.Errorf("storage.persistJobs err: %v", err))
	}

	pw.CompressionType = parquet.CompressionCodec_SNAPPY

	storeCompleted.Range(func(key, value interface{}) bool {
		jobinfo := value.(*JobIndex)
		fmt.Println("PERSISTING", jobinfo.Store, time.Unix(jobinfo.Date, 0))
		pw.Write(value.(*JobIndex))
		return true
	})

	if sErr := pw.WriteStop(); sErr != nil {
		panic(fmt.Errorf("storage.persistJobs sErr: %v", sErr))
	}

	cErr := fw.Close()
	if cErr != nil {
		panic(fmt.Errorf("storage.persistJobs cErr: %v", cErr))
	}
}
