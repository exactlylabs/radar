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
	"sync"
	"sync/atomic"
	"time"

	gcpstorage "cloud.google.com/go/storage"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/storage"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const (
	preSwitchFormat  = "2006/01/20060102"
	postSwitchFormat = "2006/01/02/20060102"
	searchSwitchDate = "2020-02-18"
	ndt7Bucket       = "archive-measurement-lab"
)

type NDTMeasurementTCPInfo struct {
	BytesAcked    int64 // for download rate
	BytesReceived int64 // for upload rate
	ElapsedTime   int64
}

type NDTMeasurementServerMeasurement struct {
	TCPInfo NDTMeasurementTCPInfo
}

type NDTMeasurementUpload struct {
	UUID               string
	StartTime          string
	ServerMeasurements []NDTMeasurementServerMeasurement
}

type NDTMeasurementDownload struct {
	UUID               string
	StartTime          string
	ServerMeasurements []NDTMeasurementServerMeasurement
}

type NDTMeasurement struct {
	ClientIP string
	Download *NDTMeasurementDownload
	Upload   *NDTMeasurementUpload
}

type fetchWorkItem struct {
	day          time.Time
	path         string
	total        int32
	completedRef *int32
}

type fetchingPool struct {
	context context.Context
	wg      *sync.WaitGroup
	ch      chan *fetchWorkItem
}

func innerGzipReader(reader io.Reader, day time.Time) error {
	gz, err := gzip.NewReader(reader)

	if err != nil {
		return fmt.Errorf("fetcher.innerGzipReader err: %v", err)
	}

	defer gz.Close()

	b, rErr := ioutil.ReadAll(gz)
	if rErr != nil {
		return fmt.Errorf("fetcher.innerGzipReader rErr: %v", rErr)
	}

	var m NDTMeasurement
	jErr := json.Unmarshal(b, &m)
	if jErr != nil {
		return fmt.Errorf("fetcher.innerGzipReader jErr: %v", jErr)
	}

	if m.Download != nil && len(m.Download.ServerMeasurements) > 0 {
		l := len(m.Download.ServerMeasurements)
		mbps := 8 * float32(m.Download.ServerMeasurements[l-1].TCPInfo.BytesAcked) / float32(m.Download.ServerMeasurements[l-1].TCPInfo.ElapsedTime)
		startedAt, tErr := time.Parse(time.RFC3339, m.Download.StartTime)
		if tErr != nil {
			return fmt.Errorf("fetcher.innerGzipReader tErr: %v", tErr)
		}
		storage.PushDatedRow("fetched", day, &models.FetchedResult{
			Id:        m.Download.UUID,
			IP:        m.ClientIP,
			StartedAt: startedAt.Unix(),
			Upload:    false,
			MBPS:      mbps,
		})
	}

	if m.Upload != nil && len(m.Upload.ServerMeasurements) > 0 {
		l := len(m.Upload.ServerMeasurements)
		mbps := 8 * float32(m.Upload.ServerMeasurements[l-1].TCPInfo.BytesReceived) / float32(m.Upload.ServerMeasurements[l-1].TCPInfo.ElapsedTime)
		startedAt, tErr := time.Parse(time.RFC3339, m.Upload.StartTime)
		if tErr != nil {
			return fmt.Errorf("fetcher.innerGzipReader tErr: %v", tErr)
		}
		storage.PushDatedRow("fetched", day, &models.FetchedResult{
			Id:        m.Upload.UUID,
			IP:        m.ClientIP,
			StartedAt: startedAt.Unix(),
			Upload:    true,
			MBPS:      mbps,
		})
	}

	return nil
}

func processReader(r io.ReadCloser, day time.Time) error {
	gzf, err := gzip.NewReader(r)
	if err != nil {
		return fmt.Errorf("fetcher.processReader err: %v", err)
	}

	tarReader := tar.NewReader(gzf)

	i := 0
	for {
		header, tErr := tarReader.Next()

		if tErr == io.EOF {
			break
		}

		if tErr != nil {
			return fmt.Errorf("fetcher.processReader tErr: %v", tErr)
		}

		name := header.Name

		switch header.Typeflag {
		case tar.TypeDir:
			continue
		case tar.TypeReg:
			innerErr := innerGzipReader(tarReader, day)
			if innerErr != nil {
				return fmt.Errorf("fetcher.processReader innerErr: %v", innerErr)
			}
		default:
			return fmt.Errorf("fetcher.processReader unknown type: %v in file %v", header.Typeflag, name)
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
		object, fErr := client.Bucket(ndt7Bucket).Object(item.path).NewReader(ctx)
		if fErr != nil {
			panic(fmt.Errorf("fetcher.fetchingWorker fErr: %v", fErr))
		}
		defer object.Close()

		processReader(object, item.day)

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

func (p *fetchingPool) queue(day time.Time, path string, total int32, completedRef *int32) {
	p.ch <- &fetchWorkItem{day, path, total, completedRef}
}

func (p *fetchingPool) close() {
	close(p.ch)
	p.wg.Wait()
}

func searchPrefixes(day time.Time) []string {
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
		objectPaths := []string{}

		searchPrefixes := searchPrefixes(date)
		for _, prefix := range searchPrefixes {
			iter := client.Bucket(ndt7Bucket).Objects(ctx, &gcpstorage.Query{Prefix: prefix})
			item, iErr := iter.Next()

			if iErr != nil && iErr != iterator.Done {
				panic(fmt.Errorf("fetcher.Fetch iErr: %v", iErr))
			}
			for item != nil {
				total += 1
				objectPaths = append(objectPaths, item.Name)

				item, iErr = iter.Next()
				if iErr != nil && iErr != iterator.Done {
					panic(fmt.Errorf("fetcher.Fetch iErr: %v", iErr))
				}
			}
		}

		completed := int32(0)
		for _, path := range objectPaths {
			pool.queue(date, path, total, &completed)
		}
		pool.close()
		storage.MarkCompleted("fetch", date)

		storage.Close()

	}
}
