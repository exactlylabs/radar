package fetcher

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	gcpstorage "cloud.google.com/go/storage"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt5"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt7"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/web100"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/gofrs/uuid"

	"github.com/exactlylabs/mlab-processor/pkg/app/writer"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const StepName string = "fetch"

const (
	preSwitchFormat  = "2006/01/20060102"
	postSwitchFormat = "2006/01/02"
	searchSwitchDate = "2020-02-18"
	mlabBucket       = "archive-measurement-lab"
)

type testType string

const (
	NDT7TestType   testType = "ndt7"
	NDT5TestType   testType = "ndt5"
	Web100TestType testType = "web100"
)

type fetchWorkItem struct {
	day          time.Time
	path         string
	testType     testType
	total        int32
	completedRef *int32
}

type fetchingPool struct {
	context context.Context
	wg      *sync.WaitGroup
	ch      chan *fetchWorkItem
}

func accessSigFromClientMetadata(clientMetadata []ndt.NameValue) *string {
	for _, m := range clientMetadata {
		if m.Name == "access_token" {
			parts := strings.Split(m.Value, ".")
			if len(parts) != 3 {
				return nil
			}

			token := parts[2]
			return &token
		}
	}

	return nil
}

func innerNdt7GzipReader(writer *writer.DataStoreWriter, reader io.Reader, day time.Time) error {
	gz, err := gzip.NewReader(reader)
	if err != nil {
		return fmt.Errorf("fetcher.innerNdt7GzipReader err: %v", err)
	}
	defer gz.Close()

	b, rErr := ioutil.ReadAll(gz)
	if rErr != nil {
		return fmt.Errorf("fetcher.innerNdt7GzipReader rErr: %v", rErr)
	}

	var m ndt7.NDT7Result
	jErr := json.Unmarshal(b, &m)
	if jErr != nil {
		return fmt.Errorf("fetcher.innerNdt7GzipReader jErr: %v", jErr)
	}

	if m.Download != nil && len(m.Download.ServerMeasurements) > 0 {
		l := len(m.Download.ServerMeasurements)
		if m.Download.ServerMeasurements[l-1].TCPInfo != nil {
			mbps := 8 * float32(m.Download.ServerMeasurements[l-1].TCPInfo.BytesAcked) / float32(m.Download.ServerMeasurements[l-1].TCPInfo.ElapsedTime)
			lossRate := float32(m.Download.ServerMeasurements[l-1].TCPInfo.BytesRetrans) / float32(m.Download.ServerMeasurements[l-1].TCPInfo.BytesSent)
			rtt := float32(m.Download.ServerMeasurements[l-1].TCPInfo.MinRTT) / 1000

			startedAt := m.Download.StartTime
			writer.WriteItem(&models.FetchedResult{
				Id:             m.Download.UUID,
				TestStyle:      "ndt7",
				IP:             m.ClientIP,
				StartedAt:      startedAt.Unix(),
				Upload:         false,
				MBPS:           mbps,
				LossRate:       &lossRate,
				MinRTT:         &rtt,
				HasAccessToken: accessSigFromClientMetadata(m.Download.ClientMetadata) != nil,
				// Commented given large resulting size: AccessTokenSig: accessSigFromClientMetadata(m.Download.ClientMetadata),
			})
		}

	}

	if m.Upload != nil && len(m.Upload.ServerMeasurements) > 0 {
		l := len(m.Upload.ServerMeasurements)
		if m.Upload.ServerMeasurements[l-1].TCPInfo != nil {
			mbps := 8 * float32(m.Upload.ServerMeasurements[l-1].TCPInfo.BytesReceived) / float32(m.Upload.ServerMeasurements[l-1].TCPInfo.ElapsedTime)
			rtt := float32(m.Upload.ServerMeasurements[l-1].TCPInfo.MinRTT) / 1000

			startedAt := m.Upload.StartTime
			writer.WriteItem(&models.FetchedResult{
				Id:             m.Upload.UUID,
				TestStyle:      "ndt7",
				IP:             m.ClientIP,
				StartedAt:      startedAt.Unix(),
				Upload:         true,
				MBPS:           mbps,
				LossRate:       nil, // Not able to calculate loss rate for upload
				MinRTT:         &rtt,
				HasAccessToken: accessSigFromClientMetadata(m.Upload.ClientMetadata) != nil,
				// Commented given large resulting size: AccessTokenSig: accessSigFromClientMetadata(m.Upload.ClientMetadata),
			})
		}

	}

	return nil
}

func processNdt7Reader(writer *writer.DataStoreWriter, r io.Reader, day time.Time) error {
	gzf, err := gzip.NewReader(r)
	if err != nil {
		return fmt.Errorf("fetcher.processNdt7Reader err: %v", err)
	}

	tarReader := tar.NewReader(gzf)

	i := 0
	for {
		header, tErr := tarReader.Next()

		if tErr == io.EOF {
			break
		}

		if tErr != nil {
			return fmt.Errorf("fetcher.processNdt7Reader tErr: %v", tErr)
		}

		name := header.Name

		switch header.Typeflag {
		case tar.TypeDir:
			continue
		case tar.TypeReg:
			innerErr := innerNdt7GzipReader(writer, tarReader, day)
			if innerErr != nil {
				return fmt.Errorf("fetcher.processNdt7Reader innerErr: %v", innerErr)
			}
		default:
			return fmt.Errorf("fetcher.processNdt7Reader unknown type: %v in file %v", header.Typeflag, name)
		}

		i++
	}

	return nil
}

// innerNdt5Reader parses the NDT5 format and pushes two rows into the storage
// one for upload and another for download data
func innerNdt5Reader(writer *writer.DataStoreWriter, reader io.Reader, day time.Time) error {
	b, rErr := ioutil.ReadAll(reader)
	if rErr != nil {
		return fmt.Errorf("fetcher.innerNdt5Reader rErr: %v", rErr)
	}

	var m ndt5.NDT5Result
	jErr := json.Unmarshal(b, &m)
	if jErr != nil {
		return fmt.Errorf("fetcher.innerNdt5Reader jErr: %v", jErr)
	}

	// Check if Upload Data is recorded
	if m.C2S != nil && m.C2S.Error == "" {
		var ptrMinRTT *float32
		if m.S2C != nil {
			// C2S doesn't have RTT information. We use S2C instead
			minRtt := float32(m.S2C.MinRTT.Milliseconds()) / 1000
			ptrMinRTT = &minRtt
		}

		writer.WriteItem(&models.FetchedResult{
			Id:             m.C2S.UUID,
			TestStyle:      "ndt5",
			IP:             m.ClientIP,
			StartedAt:      m.C2S.StartTime.Unix(),
			Upload:         true,
			MBPS:           float32(m.C2S.MeanThroughputMbps),
			LossRate:       nil, // Not able to calculate loss rate for upload
			MinRTT:         ptrMinRTT,
			HasAccessToken: false,
			AccessTokenSig: nil,
		})
	}

	// Check if Download Data is recorded
	if m.S2C != nil && m.S2C.Error == "" {
		var ptrLossRate *float32
		if m.S2C.TCPInfo != nil {
			lossRate := float32(m.S2C.TCPInfo.BytesRetrans) / float32(m.S2C.TCPInfo.BytesSent)
			ptrLossRate = &lossRate
		}

		minRtt := float32(m.S2C.MinRTT.Milliseconds()) / 1000
		writer.WriteItem(&models.FetchedResult{
			Id:             m.S2C.UUID,
			TestStyle:      "ndt5",
			IP:             m.ClientIP,
			StartedAt:      m.S2C.StartTime.Unix(),
			Upload:         false,
			MBPS:           float32(m.S2C.MeanThroughputMbps),
			LossRate:       ptrLossRate,
			MinRTT:         &minRtt,
			HasAccessToken: false,
			AccessTokenSig: nil,
		})
	}

	return nil
}

func processNdt5Reader(writer *writer.DataStoreWriter, r io.Reader, day time.Time) error {
	gzf, err := gzip.NewReader(r)
	if err != nil {
		return fmt.Errorf("fetcher.processNdt5Reader err: %v", err)
	}

	tarReader := tar.NewReader(gzf)

	i := 0
	for {
		header, tErr := tarReader.Next()

		if tErr == io.EOF {
			break
		}

		if tErr != nil {
			return fmt.Errorf("fetcher.processNdt5Reader tErr: %v", tErr)
		}

		name := header.Name

		switch header.Typeflag {
		case tar.TypeDir:
			continue
		case tar.TypeReg:
			innerErr := innerNdt5Reader(writer, tarReader, day)
			if innerErr != nil {
				return fmt.Errorf("fetcher.processNdt5Reader innerErr: %v", innerErr)
			}
		default:
			return fmt.Errorf("fetcher.processNdt5Reader unknown type: %v in file %v", header.Typeflag, name)
		}

		i++
	}

	return nil
}

func processWeb100Reader(writer *writer.DataStoreWriter, r io.Reader, day time.Time) error {
	iterator, err := readTgz(r, ".c2s_snaplog", ".s2c_snaplog")
	if err != nil {
		return fmt.Errorf("fetcher.processWeb100Reader readTgz: %w", err)
	}

	for filename, fReader, err := iterator.Next(); fReader != nil || err != nil; filename, fReader, err = iterator.Next() {
		if err != nil {
			return fmt.Errorf("fetcher.processWeb100Reader Next: %w", err)
		}
		ext := filepath.Ext(filename)
		id, _ := uuid.NewV4()
		snapConn, snapVal, err := web100.ValuesFromReader(fReader)
		if err != nil {
			// Log, but continue, since this might be an error for this single file
			log.Println(fmt.Errorf("fetcher.processWeb100Reader SnapValueFromReader: %w", err))
			continue
		}
		minRTT := float32(snapVal["MinRTT"].(int64)) / 1000
		if ext == ".c2s_snaplog" {
			// Upload
			writer.WriteItem(&models.FetchedResult{
				Id:             id.String(),
				TestStyle:      "web100",
				IP:             snapConn["remote_ip"].(string),
				StartedAt:      snapVal["StartTimeStamp"].(int64),
				Upload:         true,
				MBPS:           web100.GetUploadMbps(snapVal),
				LossRate:       nil,
				MinRTT:         &minRTT,
				HasAccessToken: false,
				AccessTokenSig: nil,
			})
		} else {
			// Download
			lossRate := float32(snapVal["OctetsRetrans"].(int64)) / float32(snapVal["HCThruOctetsAcked"].(int64))
			writer.WriteItem(&models.FetchedResult{
				Id:             id.String(),
				TestStyle:      "web100",
				IP:             snapConn["remote_ip"].(string),
				StartedAt:      snapVal["StartTimeStamp"].(int64),
				Upload:         false,
				MBPS:           web100.GetDownloadMbps(snapVal),
				LossRate:       &lossRate,
				MinRTT:         &minRTT,
				HasAccessToken: false,
				AccessTokenSig: nil,
			})
		}
	}
	return nil
}

func fetchingWorker(wg *sync.WaitGroup, ctx context.Context, writer *writer.DataStoreWriter, ch chan *fetchWorkItem) {
	defer wg.Done()

	client, err := gcpstorage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		panic(fmt.Errorf("fetcher.fetchingWorker err: %v", err))
	}

	for item := range ch {
		object, fErr := client.Bucket(mlabBucket).Object(item.path).NewReader(ctx)
		if fErr != nil {
			panic(fmt.Errorf("fetcher.fetchingWorker fErr: %v", fErr))
		}

		if item.testType == NDT7TestType {
			processNdt7Reader(writer, object, item.day)
			if err != nil {
				log.Println(err)
			}
		} else if item.testType == NDT5TestType {
			processNdt5Reader(writer, object, item.day)
			if err != nil {
				log.Println(err)
			}
		} else if item.testType == Web100TestType {
			err := processWeb100Reader(writer, object, item.day)
			if err != nil {
				log.Println(err)
			}
		}

		atomic.AddInt32(item.completedRef, 1)
		if *item.completedRef%500 == 0 {
			fmt.Printf("Fetch %v - %v: %d of %d\n", item.testType, item.day, *item.completedRef, item.total)
		}

		// Close object after each iteration
		object.Close()
		if item.total == *item.completedRef {
			return
		}
	}
}

func newFetchingPool(ctx context.Context, writer *writer.DataStoreWriter) *fetchingPool {
	wg := &sync.WaitGroup{}
	ch := make(chan *fetchWorkItem, 100)

	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go fetchingWorker(wg, ctx, writer, ch)
	}

	return &fetchingPool{
		context: ctx,
		wg:      wg,
		ch:      ch,
	}
}

func (p *fetchingPool) queue(day time.Time, path string, tt testType, total int32, completedRef *int32) {
	p.ch <- &fetchWorkItem{day, path, tt, total, completedRef}
}

func (p *fetchingPool) close() {
	close(p.ch)
	p.wg.Wait()
}

func ndt7SearchPrefixes(day time.Time) []string {
	switchDate, err := time.Parse("2006-01-02", searchSwitchDate)
	if err != nil {
		panic(fmt.Errorf("failed to parse static switch date: %w", err))
	}

	if day == switchDate {
		return []string{"ndt/ndt7/" + day.Format(postSwitchFormat), "ndt/ndt7/" + day.Format(preSwitchFormat)}
	} else if day.Before(switchDate) {
		return []string{"ndt/ndt7/" + day.Format(preSwitchFormat)}
	} else {
		return []string{"ndt/ndt7/" + day.Format(postSwitchFormat)}
	}
}

func ndt5SearchPrefix(day time.Time) string {
	return "ndt/ndt5/" + day.Format(postSwitchFormat)
}

func web100SearchPrefix(day time.Time) string {
	return "ndt/web100/" + day.Format(postSwitchFormat)
}

func processDate(ctx context.Context, client *gcpstorage.Client, ds datastore.DataStore, date time.Time) error {
	writer := writer.NewWriter(ds)
	defer writer.Close()
	pool := newFetchingPool(ctx, writer)

	total := int32(0)
	fmt.Println("Fetch - Enumerating files")

	// Enumerate Web100 task
	web100ObjectPaths := []string{}
	web100Prefix := web100SearchPrefix(date)
	iter := client.Bucket(mlabBucket).Objects(ctx, &gcpstorage.Query{Prefix: web100Prefix})
	item, iErr := iter.Next()
	if iErr != nil && iErr != iterator.Done {
		panic(fmt.Errorf("fetcher.processDate iErr: %v", iErr))
	}
	for item != nil {
		total += 1
		web100ObjectPaths = append(web100ObjectPaths, item.Name)

		item, iErr = iter.Next()
		if iErr != nil && iErr != iterator.Done {
			panic(fmt.Errorf("fetcher.processDate iErr: %v", iErr))
		}
	}

	// Enumerate NDT5 task
	ndt5ObjectPaths := []string{}
	ndt5Prefix := ndt5SearchPrefix(date)
	iter = client.Bucket(mlabBucket).Objects(ctx, &gcpstorage.Query{Prefix: ndt5Prefix})
	item, iErr = iter.Next()

	if iErr != nil && iErr != iterator.Done {
		panic(fmt.Errorf("fetcher.processDate iErr: %v", iErr))
	}
	for item != nil {
		total += 1
		ndt5ObjectPaths = append(ndt5ObjectPaths, item.Name)

		item, iErr = iter.Next()
		if iErr != nil && iErr != iterator.Done {
			panic(fmt.Errorf("fetcher.processDate iErr: %v", iErr))
		}
	}

	// Enumerate NDT7 tasks
	ndt7ObjectPaths := []string{}
	searchPrefixes := ndt7SearchPrefixes(date)
	for _, prefix := range searchPrefixes {
		iter := client.Bucket(mlabBucket).Objects(ctx, &gcpstorage.Query{Prefix: prefix})
		item, iErr := iter.Next()

		if iErr != nil && iErr != iterator.Done {
			panic(fmt.Errorf("fetcher.processDate iErr: %v", iErr))
		}
		for item != nil {
			total += 1
			ndt7ObjectPaths = append(ndt7ObjectPaths, item.Name)

			item, iErr = iter.Next()
			if iErr != nil && iErr != iterator.Done {
				panic(fmt.Errorf("fetcher.processDate iErr: %v", iErr))
			}
		}
	}
	log.Printf("Fetch - finished enumerating, starting to fetch %d files", total)
	completed := int32(0)
	for _, path := range web100ObjectPaths {
		pool.queue(date, path, Web100TestType, total, &completed)
	}
	for _, path := range ndt5ObjectPaths {
		pool.queue(date, path, NDT5TestType, total, &completed)
	}
	for _, path := range ndt7ObjectPaths {
		pool.queue(date, path, NDT7TestType, total, &completed)
	}

	pool.close() // Waits until all pending jobs are finished

	return nil
}

// Fetch data of a single day from MLab, flatten it and store into the datastore
func Fetch(ds datastore.DataStore, date time.Time) {
	defer timer.TimeIt(time.Now(), "Fetch")
	ctx := context.Background()
	client, err := gcpstorage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		panic(fmt.Errorf("fetcher.Fetch err: %v", err))
	}
	defer client.Close()
	if err := processDate(ctx, client, ds, date); err != nil {
		panic(err)
	}

}
