package fetcher

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	gcpstorage "cloud.google.com/go/storage"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt5"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt7"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/storage"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const (
	preSwitchFormat  = "2006/01/20060102"
	postSwitchFormat = "2006/01/02"
	searchSwitchDate = "2020-02-18"
	mlabBucket       = "archive-measurement-lab"
)

type testType string

const (
	NDT7TestType testType = "ndt7"
	NDT5TestType          = "ndt5"
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

func innerNdt7GzipReader(reader io.Reader, day time.Time) error {
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
		mbps := 8 * float32(m.Download.ServerMeasurements[l-1].TCPInfo.BytesAcked) / float32(m.Download.ServerMeasurements[l-1].TCPInfo.ElapsedTime)
		lossRate := float32(m.Download.ServerMeasurements[l-1].TCPInfo.BytesRetrans) / float32(m.Download.ServerMeasurements[l-1].TCPInfo.BytesSent)
		rtt := float32(m.Download.ServerMeasurements[l-1].TCPInfo.MinRTT) / 1000

		startedAt := m.Download.StartTime
		storage.PushDatedRow("fetched", day, &models.FetchedResult{
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

	if m.Upload != nil && len(m.Upload.ServerMeasurements) > 0 {
		l := len(m.Upload.ServerMeasurements)
		mbps := 8 * float32(m.Upload.ServerMeasurements[l-1].TCPInfo.BytesReceived) / float32(m.Upload.ServerMeasurements[l-1].TCPInfo.ElapsedTime)
		rtt := float32(m.Upload.ServerMeasurements[l-1].TCPInfo.MinRTT) / 1000

		startedAt := m.Upload.StartTime
		storage.PushDatedRow("fetched", day, &models.FetchedResult{
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

	return nil
}

func processNdt7Reader(r io.Reader, day time.Time) error {
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
			innerErr := innerNdt7GzipReader(tarReader, day)
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

func innerNdt5Reader(reader io.Reader, day time.Time) error {
	b, rErr := ioutil.ReadAll(reader)
	if rErr != nil {
		return fmt.Errorf("fetcher.innerNdt5Reader rErr: %v", rErr)
	}

	var m ndt5.NDT5Result
	jErr := json.Unmarshal(b, &m)
	if jErr != nil {
		return fmt.Errorf("fetcher.innerNdt5Reader jErr: %v", jErr)
	}

	if m.C2S != nil && m.C2S.Error == "" {
		var ptrMinRTT *float32
		if m.S2C != nil {
			minRtt := float32(m.S2C.MinRTT.Milliseconds()) / 1000
			ptrMinRTT = &minRtt
		}

		storage.PushDatedRow("fetched", day, &models.FetchedResult{
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

	if m.S2C != nil && m.S2C.Error == "" {
		var ptrLossRate *float32
		if m.S2C.TCPInfo != nil {
			lossRate := float32(m.S2C.TCPInfo.BytesRetrans) / float32(m.S2C.TCPInfo.BytesSent)
			ptrLossRate = &lossRate
		}

		minRtt := float32(m.S2C.MinRTT.Milliseconds()) / 1000
		storage.PushDatedRow("fetched", day, &models.FetchedResult{
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

func processNdt5Reader(r io.Reader, day time.Time) error {
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
			innerErr := innerNdt5Reader(tarReader, day)
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

func fetchingWorker(wg *sync.WaitGroup, ctx context.Context, ch chan *fetchWorkItem) {
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
		defer object.Close()

		if item.testType == NDT7TestType {
			processNdt7Reader(object, item.day)
		} else if item.testType == NDT5TestType {
			processNdt5Reader(object, item.day)
		}

		atomic.AddInt32(item.completedRef, 1)
		if item.total == *item.completedRef {
			storage.CloseDatedRow("fetched", item.day)
		}
	}
}

func newFetchingPool(ctx context.Context) *fetchingPool {
	wg := &sync.WaitGroup{}
	ch := make(chan *fetchWorkItem, 100)

	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go fetchingWorker(wg, ctx, ch)
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

func Fetch(startDate, endDate time.Time, rerun bool) {
	ctx := context.Background()
	var dateRange []time.Time
	if rerun {
		dateRange = helpers.DateRange(startDate, endDate)
	} else {
		dateRange = storage.Incomplete("fetch", startDate, endDate)
	}

	client, err := gcpstorage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		panic(fmt.Errorf("fetcher.Fetch err: %v", err))
	}

	for _, date := range dateRange {
		pool := newFetchingPool(ctx)

		total := int32(0)

		// Enumerate NDT5 task
		ndt5ObjectPaths := []string{}
		ndt5Prefix := ndt5SearchPrefix(date)
		iter := client.Bucket(mlabBucket).Objects(ctx, &gcpstorage.Query{Prefix: ndt5Prefix})
		item, iErr := iter.Next()

		if iErr != nil && iErr != iterator.Done {
			panic(fmt.Errorf("fetcher.Fetch iErr: %v", iErr))
		}
		for item != nil {
			total += 1
			ndt5ObjectPaths = append(ndt5ObjectPaths, item.Name)

			item, iErr = iter.Next()
			if iErr != nil && iErr != iterator.Done {
				panic(fmt.Errorf("fetcher.Fetch iErr: %v", iErr))
			}
		}

		// Enumerate NDT7 tasks
		ndt7ObjectPaths := []string{}
		searchPrefixes := ndt7SearchPrefixes(date)
		for _, prefix := range searchPrefixes {
			iter := client.Bucket(mlabBucket).Objects(ctx, &gcpstorage.Query{Prefix: prefix})
			item, iErr := iter.Next()

			if iErr != nil && iErr != iterator.Done {
				panic(fmt.Errorf("fetcher.Fetch iErr: %v", iErr))
			}
			for item != nil {
				total += 1
				ndt7ObjectPaths = append(ndt7ObjectPaths, item.Name)

				item, iErr = iter.Next()
				if iErr != nil && iErr != iterator.Done {
					panic(fmt.Errorf("fetcher.Fetch iErr: %v", iErr))
				}
			}
		}

		completed := int32(0)
		for _, path := range ndt5ObjectPaths {
			pool.queue(date, path, NDT5TestType, total, &completed)
		}
		for _, path := range ndt7ObjectPaths {
			pool.queue(date, path, NDT7TestType, total, &completed)
		}

		pool.close()
		storage.MarkCompleted("fetch", date)

		storage.Close()
	}
}
