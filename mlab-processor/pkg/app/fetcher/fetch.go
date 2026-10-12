package fetcher

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/datastorewriter"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt5"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt7"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/web100"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/gofrs/uuid"

	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/timer"
)

const StepName string = "fetch"

const (
	preSwitchFormat  = "2006/01/20060102"
	postSwitchFormat = "2006/01/02"
	searchSwitchDate = "2020-02-18"
)

type testType string

const (
	NDT7TestType   testType = "ndt7"
	NDT5TestType   testType = "ndt5"
	Web100TestType testType = "web100"
)

// Options tune the fetch. The zero value means the defaults.
type Options struct {
	// Workers is the number of tarballs processed in parallel (default NumCPU).
	Workers int
	// Attempts is how often a tarball (or a listing) is tried before the date fails (default 3).
	Attempts int
	// Backoff is the wait before the 2nd attempt; it doubles for each further one (default 5s).
	Backoff time.Duration
	// TarballTimeout bounds one attempt at one tarball, so a stalled download is retried
	// instead of hanging the run (default 30m).
	TarballTimeout time.Duration
}

func (o Options) withDefaults() Options {
	if o.Workers <= 0 {
		o.Workers = runtime.NumCPU()
	}
	if o.Attempts <= 0 {
		o.Attempts = 3
	}
	if o.Backoff <= 0 {
		o.Backoff = 5 * time.Second
	}
	if o.TarballTimeout <= 0 {
		o.TarballTimeout = 30 * time.Minute
	}
	return o
}

// Stats is the per-date accounting of a fetch.
type Stats struct {
	// Listed is the number of tarballs found in the M-Lab archive, per test type.
	Listed map[string]int `json:"listed"`
	// Processed is the number of tarballs fully read, per test type.
	Processed map[string]int `json:"processed"`
	// Tests is the number of rows written (one per upload/download measurement).
	Tests int64 `json:"tests"`
	// BadFiles counts test files inside otherwise healthy tarballs that could not be
	// parsed (corrupt JSON/snaplog); they are skipped, as before.
	BadFiles int64 `json:"bad_files"`
	// Retries counts tarball attempts that failed and were retried.
	Retries int64 `json:"retries"`
}

// TotalListed / TotalProcessed sum over test types.
func (s *Stats) TotalListed() int    { return sum(s.Listed) }
func (s *Stats) TotalProcessed() int { return sum(s.Processed) }

func sum(m map[string]int) int {
	t := 0
	for _, v := range m {
		t += v
	}
	return t
}

// Complete is true when every listed tarball was processed and at least one was listed.
func (s *Stats) Complete() bool {
	return s.TotalListed() > 0 && s.TotalListed() == s.TotalProcessed()
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

type emitFunc func(*models.FetchedResult)

// lastMeasurement decodes a JSON array of ndt7 measurements keeping only the TCPInfo of
// the last element, which is all the fetcher uses.
type lastMeasurement struct {
	n       int
	tcpInfo *ndt7.TCPInfo
}

func (l *lastMeasurement) UnmarshalJSON(b []byte) error {
	l.n, l.tcpInfo = 0, nil
	if bytes.Equal(bytes.TrimSpace(b), []byte("null")) {
		return nil
	}
	dec := json.NewDecoder(bytes.NewReader(b))
	if _, err := dec.Token(); err != nil { // '['
		return err
	}
	for dec.More() {
		var m struct {
			TCPInfo *ndt7.TCPInfo
		}
		if err := dec.Decode(&m); err != nil {
			return err
		}
		l.n++
		l.tcpInfo = m.TCPInfo
	}
	_, err := dec.Token() // ']'
	return err
}

type ndt7Archival struct {
	UUID               string
	StartTime          time.Time
	ServerMeasurements lastMeasurement
	ClientMetadata     []ndt.NameValue `json:",omitempty"`
}

// ndt7Lean is the subset of ndt7.NDT7Result the fetcher reads.
type ndt7Lean struct {
	ClientIP string
	Upload   *ndt7Archival
	Download *ndt7Archival
}

func innerNdt7GzipReader(emit emitFunc, reader io.Reader, gz *gzip.Reader) error {
	if err := gz.Reset(reader); err != nil {
		return fmt.Errorf("fetcher.innerNdt7GzipReader err: %v", err)
	}

	var m ndt7Lean
	if jErr := json.NewDecoder(gz).Decode(&m); jErr != nil {
		return fmt.Errorf("fetcher.innerNdt7GzipReader jErr: %v", jErr)
	}
	if _, err := io.Copy(io.Discard, gz); err != nil { // verify the gzip checksum
		return fmt.Errorf("fetcher.innerNdt7GzipReader rErr: %v", err)
	}

	if m.Download != nil && m.Download.ServerMeasurements.n > 0 {
		if tcp := m.Download.ServerMeasurements.tcpInfo; tcp != nil {
			mbps := 8 * float32(tcp.BytesAcked) / float32(tcp.ElapsedTime)
			lossRate := float32(tcp.BytesRetrans) / float32(tcp.BytesSent)
			rtt := float32(tcp.MinRTT) / 1000

			emit(&models.FetchedResult{
				Id:             m.Download.UUID,
				TestStyle:      "ndt7",
				IP:             m.ClientIP,
				StartedAt:      m.Download.StartTime.Unix(),
				Upload:         false,
				MBPS:           mbps,
				LossRate:       &lossRate,
				MinRTT:         &rtt,
				HasAccessToken: accessSigFromClientMetadata(m.Download.ClientMetadata) != nil,
			})
		}
	}

	if m.Upload != nil && m.Upload.ServerMeasurements.n > 0 {
		if tcp := m.Upload.ServerMeasurements.tcpInfo; tcp != nil {
			mbps := 8 * float32(tcp.BytesReceived) / float32(tcp.ElapsedTime)
			rtt := float32(tcp.MinRTT) / 1000

			emit(&models.FetchedResult{
				Id:             m.Upload.UUID,
				TestStyle:      "ndt7",
				IP:             m.ClientIP,
				StartedAt:      m.Upload.StartTime.Unix(),
				Upload:         true,
				MBPS:           mbps,
				LossRate:       nil, // Not able to calculate loss rate for upload
				MinRTT:         &rtt,
				HasAccessToken: accessSigFromClientMetadata(m.Upload.ClientMetadata) != nil,
			})
		}
	}

	return nil
}

// walkTar calls fn for each regular file of a .tgz stream. Errors returned by fn are
// per-test-file problems: they are counted in badFiles and the walk continues. If the
// error was really caused by the outer stream, the next tar.Next fails (tar and gzip
// readers keep their error) and the whole tarball fails, to be retried.
func walkTar(r io.Reader, badFiles *int64, fn func(name string, r io.Reader) error) error {
	gzf, err := gzip.NewReader(r)
	if err != nil {
		return fmt.Errorf("gzip: %w", err)
	}
	defer gzf.Close()
	tarReader := tar.NewReader(gzf)
	for {
		header, tErr := tarReader.Next()
		if tErr == io.EOF {
			break
		}
		if tErr != nil {
			return fmt.Errorf("tar: %w", tErr)
		}
		switch header.Typeflag {
		case tar.TypeDir:
			continue
		case tar.TypeReg:
			if innerErr := fn(header.Name, tarReader); innerErr != nil {
				atomic.AddInt64(badFiles, 1)
				log.Printf("fetcher: skipping %s: %v", header.Name, innerErr)
			}
		default:
			return fmt.Errorf("unknown type: %v in file %v", header.Typeflag, header.Name)
		}
	}
	// Read to the end so a truncated gzip trailer is noticed.
	if _, err := io.Copy(io.Discard, gzf); err != nil {
		return fmt.Errorf("gzip trailer: %w", err)
	}
	return nil
}

func processNdt7Reader(emit emitFunc, r io.Reader, badFiles *int64) error {
	gz := new(gzip.Reader)
	return walkTar(r, badFiles, func(name string, r io.Reader) error {
		return innerNdt7GzipReader(emit, r, gz)
	})
}

// innerNdt5Reader parses the NDT5 format and pushes two rows into the storage
// one for upload and another for download data
func innerNdt5Reader(emit emitFunc, reader io.Reader) error {
	b, rErr := io.ReadAll(reader)
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

		emit(&models.FetchedResult{
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
		emit(&models.FetchedResult{
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

func processNdt5Reader(emit emitFunc, r io.Reader, badFiles *int64) error {
	return walkTar(r, badFiles, func(name string, r io.Reader) error {
		return innerNdt5Reader(emit, r)
	})
}

func processWeb100Reader(emit emitFunc, r io.Reader, badFiles *int64) error {
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
			atomic.AddInt64(badFiles, 1)
			log.Println(fmt.Errorf("fetcher.processWeb100Reader SnapValueFromReader: %w", err))
			continue
		}
		minRTT := float32(snapVal["MinRTT"].(int64)) / 1000
		if ext == ".c2s_snaplog" {
			// Upload
			emit(&models.FetchedResult{
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
			emit(&models.FetchedResult{
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

func parseTarball(tt testType, emit emitFunc, r io.Reader, badFiles *int64) error {
	switch tt {
	case NDT7TestType:
		return processNdt7Reader(emit, r, badFiles)
	case NDT5TestType:
		return processNdt5Reader(emit, r, badFiles)
	case Web100TestType:
		return processWeb100Reader(emit, r, badFiles)
	}
	return fmt.Errorf("unknown test type %q", tt)
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

type tarball struct {
	path     string
	testType testType
}

// sleepCtx waits d or until ctx is done.
func sleepCtx(ctx context.Context, d time.Duration) error {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-t.C:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func withRetries(ctx context.Context, opts Options, what string, retries *int64, fn func() error) error {
	var err error
	for i := 0; i < opts.Attempts; i++ {
		if i > 0 {
			atomic.AddInt64(retries, 1)
			if sErr := sleepCtx(ctx, opts.Backoff<<(i-1)); sErr != nil {
				return sErr
			}
		}
		if err = fn(); err == nil {
			return nil
		}
		if ctx.Err() != nil {
			return ctx.Err()
		}
		log.Printf("Fetch - %s failed (attempt %d/%d): %v", what, i+1, opts.Attempts, err)
	}
	return fmt.Errorf("%s: giving up after %d attempts: %w", what, opts.Attempts, err)
}

// ListTarballs lists the archive tarballs of date, per test type, retrying failed listings.
func ListTarballs(ctx context.Context, src ObjectSource, date time.Time, opts Options) (map[testType][]string, error) {
	opts = opts.withDefaults()
	prefixes := map[testType][]string{
		Web100TestType: {web100SearchPrefix(date)},
		NDT5TestType:   {ndt5SearchPrefix(date)},
		NDT7TestType:   ndt7SearchPrefixes(date),
	}
	out := map[testType][]string{}
	var retries int64
	for _, tt := range []testType{Web100TestType, NDT5TestType, NDT7TestType} {
		for _, prefix := range prefixes[tt] {
			var names []string
			err := withRetries(ctx, opts, "list "+prefix, &retries, func() error {
				var lErr error
				names, lErr = src.List(ctx, prefix)
				return lErr
			})
			if err != nil {
				return nil, err
			}
			out[tt] = append(out[tt], names...)
		}
	}
	return out, nil
}

// CountTarballs returns the number of archive tarballs for date (all test types).
func CountTarballs(ctx context.Context, src ObjectSource, date time.Time, opts Options) (int, error) {
	l, err := ListTarballs(ctx, src, date, opts)
	if err != nil {
		return 0, err
	}
	n := 0
	for _, v := range l {
		n += len(v)
	}
	return n, nil
}

// FetchDate downloads every tarball of date from the archive, flattens the tests and
// writes them to ds. Each tarball is parsed into memory first and only written once it
// was read completely, so a retry never duplicates rows. If a tarball still fails after
// opts.Attempts tries the date fails: an error is returned and ds must not be stored.
func FetchDate(ctx context.Context, src ObjectSource, ds datastore.DataStore, date time.Time, opts Options) (*Stats, error) {
	defer timer.TimeIt(time.Now(), "Fetch")
	opts = opts.withDefaults()
	stats := &Stats{Listed: map[string]int{}, Processed: map[string]int{}}

	listed, err := ListTarballs(ctx, src, date, opts)
	if err != nil {
		return stats, fmt.Errorf("fetch %s: listing: %w", date.Format("2006-01-02"), err)
	}
	var work []tarball
	for _, tt := range []testType{Web100TestType, NDT5TestType, NDT7TestType} {
		stats.Listed[string(tt)] = len(listed[tt])
		stats.Processed[string(tt)] = 0
		for _, p := range listed[tt] {
			work = append(work, tarball{p, tt})
		}
	}
	total := len(work)
	log.Printf("Fetch - %s: listed %d tarballs (web100 %d, ndt5 %d, ndt7 %d)", date.Format("2006-01-02"), total,
		stats.Listed[string(Web100TestType)], stats.Listed[string(NDT5TestType)], stats.Listed[string(NDT7TestType)])
	if total == 0 {
		return stats, fmt.Errorf("fetch %s: no tarballs listed in the archive", date.Format("2006-01-02"))
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	writer := datastorewriter.NewWriter(ds)
	ch := make(chan tarball)
	var (
		wg        sync.WaitGroup
		mu        sync.Mutex
		firstErr  error
		completed int64
	)
	fail := func(err error) {
		mu.Lock()
		if firstErr == nil {
			firstErr = err
		}
		mu.Unlock()
		cancel()
	}
	for i := 0; i < opts.Workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for item := range ch {
				var rows []*models.FetchedResult
				var badFiles int64
				err := withRetries(ctx, opts, item.path, &stats.Retries, func() error {
					rows = rows[:0]
					badFiles = 0
					actx, acancel := context.WithTimeout(ctx, opts.TarballTimeout)
					defer acancel()
					r, oErr := src.Open(actx, item.path)
					if oErr != nil {
						return oErr
					}
					defer r.Close()
					return parseTarball(item.testType, func(fr *models.FetchedResult) { rows = append(rows, fr) }, r, &badFiles)
				})
				if err != nil {
					if !errors.Is(err, context.Canceled) {
						fail(err)
					}
					continue
				}
				for _, row := range rows {
					writer.WriteItem(row)
				}
				atomic.AddInt64(&stats.BadFiles, badFiles)
				mu.Lock()
				stats.Processed[string(item.testType)]++
				mu.Unlock()
				if n := atomic.AddInt64(&completed, 1); n%500 == 0 {
					log.Printf("Fetch - %s: %d of %d tarballs", date.Format("2006-01-02"), n, total)
				}
			}
		}()
	}
FEED:
	for _, item := range work {
		select {
		case ch <- item:
		case <-ctx.Done():
			break FEED
		}
	}
	close(ch)
	wg.Wait()
	wErr := writer.Close()
	stats.Tests = writer.Written()

	if firstErr != nil {
		return stats, fmt.Errorf("fetch %s: %w", date.Format("2006-01-02"), firstErr)
	}
	if wErr != nil {
		return stats, fmt.Errorf("fetch %s: %w", date.Format("2006-01-02"), wErr)
	}
	if !stats.Complete() {
		return stats, fmt.Errorf("fetch %s: incomplete: %d tarballs listed, %d processed",
			date.Format("2006-01-02"), stats.TotalListed(), stats.TotalProcessed())
	}
	return stats, nil
}
