package fetcher

import (
	"archive/tar"
	"bytes"
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
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/web100"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/gofrs/uuid"
	"github.com/klauspost/compress/gzip"
	"golang.org/x/sync/errgroup"
	"golang.org/x/sync/semaphore"

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
	// Workers is the number of tarballs parsed in parallel (default NumCPU). Parsing is
	// CPU bound, so more than the number of cores does not help.
	Workers int
	// DownloadWorkers is the number of tarballs downloaded in parallel (default
	// 4×NumCPU, at least 16). Downloads are latency bound: the archive objects are a few
	// MB each, so many have to be in flight to fill the link.
	DownloadWorkers int
	// MaxBufferedBytes bounds the downloaded-but-not-yet-parsed data held in memory
	// (default 1 GiB). A download does not start until its size fits.
	MaxBufferedBytes int64
	// LowMemory shrinks the defaults of DownloadWorkers (NumCPU) and MaxBufferedBytes
	// (256 MiB).
	LowMemory bool
	// Attempts is how often a tarball (or a listing) is tried before the date fails (default 3).
	Attempts int
	// Backoff is the wait before the 2nd attempt; it doubles for each further one (default 5s).
	Backoff time.Duration
	// TarballTimeout bounds one download of one tarball, so a stalled download is retried
	// instead of hanging the run (default 30m).
	TarballTimeout time.Duration
}

func (o Options) withDefaults() Options {
	if o.Workers <= 0 {
		o.Workers = runtime.NumCPU()
	}
	if o.DownloadWorkers <= 0 {
		o.DownloadWorkers = max(4*runtime.NumCPU(), 16)
		if o.LowMemory {
			o.DownloadWorkers = runtime.NumCPU()
		}
	}
	if o.MaxBufferedBytes <= 0 {
		o.MaxBufferedBytes = 1 << 30
		if o.LowMemory {
			o.MaxBufferedBytes = 256 << 20
		}
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

// fetchedRow is a FetchedResult with the storage of its pointer fields, so a row is one
// allocation instead of three.
type fetchedRow struct {
	models.FetchedResult
	lossRate, minRTT float32
}

// readAllInto appends r until EOF to buf (reusing its capacity) and returns it.
func readAllInto(buf []byte, r io.Reader) ([]byte, error) {
	if cap(buf) == 0 {
		buf = make([]byte, 0, 64<<10)
	}
	for {
		if len(buf) == cap(buf) {
			buf = append(buf, 0)[:len(buf)]
		}
		n, err := r.Read(buf[len(buf):cap(buf)])
		buf = buf[:len(buf)+n]
		if err == io.EOF {
			return buf, nil
		}
		if err != nil {
			return buf, err
		}
	}
}

// maxTestFile is the largest test file (a tar entry) read into memory. Real ndt7 and
// ndt5 records are tens of KB; anything beyond this is a corrupt header.
const maxTestFile = 256 << 20

// tarballParser holds the per-worker buffers of the ndt7/ndt5 paths. Every test file is
// read from the tar into raw, inflated into buf and decoded from there, so a tarball of a
// few hundred tests costs a handful of allocations instead of a few per test.
type tarballParser struct {
	gz   *gzip.Reader
	raw  []byte
	rawR bytes.Reader
	buf  []byte
	rec  ndt7Record
}

// entry reads the tar entry (a gzipped file when gzipped is set) into p.buf.
func (p *tarballParser) entry(hdr *tar.Header, r io.Reader, gzipped bool) error {
	if hdr.Size < 0 || hdr.Size > maxTestFile {
		return fmt.Errorf("tar entry of %d bytes", hdr.Size)
	}
	if !gzipped {
		p.buf = p.buf[:0]
		var err error
		p.buf, err = readAllInto(p.buf, io.LimitReader(r, hdr.Size))
		return err
	}
	n := int(hdr.Size)
	if cap(p.raw) < n {
		p.raw = make([]byte, n, n+n/4)
	}
	p.raw = p.raw[:n]
	if _, err := io.ReadFull(r, p.raw); err != nil {
		return fmt.Errorf("read: %w", err)
	}
	p.rawR.Reset(p.raw)
	if p.gz == nil {
		p.gz = new(gzip.Reader)
	}
	if err := p.gz.Reset(&p.rawR); err != nil {
		return fmt.Errorf("gzip: %w", err)
	}
	var err error
	p.buf, err = readAllInto(p.buf[:0], p.gz) // reads to EOF: the gzip checksum is verified
	if err != nil {
		return fmt.Errorf("gunzip: %w", err)
	}
	return nil
}

func (p *tarballParser) ndt7(emit emitFunc, hdr *tar.Header, r io.Reader) error {
	if err := p.entry(hdr, r, true); err != nil {
		return fmt.Errorf("fetcher.ndt7 %s: %w", hdr.Name, err)
	}
	if err := parseNdt7(p.buf, &p.rec); err != nil {
		return fmt.Errorf("fetcher.ndt7 %s: %w", hdr.Name, err)
	}
	emitNdt7(emit, &p.rec)
	return nil
}

func emitNdt7(emit emitFunc, m *ndt7Record) {
	if d := m.Download; d != nil && d.Measurements > 0 && d.TCP != nil {
		tcp := d.TCP
		row := &fetchedRow{
			lossRate: float32(tcp.BytesRetrans) / float32(tcp.BytesSent),
			minRTT:   float32(tcp.MinRTT) / 1000,
		}
		row.FetchedResult = models.FetchedResult{
			Id:             d.UUID,
			TestStyle:      "ndt7",
			IP:             m.ClientIP,
			StartedAt:      d.StartTime.Unix(),
			Upload:         false,
			MBPS:           8 * float32(tcp.BytesAcked) / float32(tcp.ElapsedTime),
			LossRate:       &row.lossRate,
			MinRTT:         &row.minRTT,
			HasAccessToken: d.HasAccessToken,
		}
		emit(&row.FetchedResult)
	}

	if u := m.Upload; u != nil && u.Measurements > 0 && u.TCP != nil {
		tcp := u.TCP
		row := &fetchedRow{minRTT: float32(tcp.MinRTT) / 1000}
		row.FetchedResult = models.FetchedResult{
			Id:             u.UUID,
			TestStyle:      "ndt7",
			IP:             m.ClientIP,
			StartedAt:      u.StartTime.Unix(),
			Upload:         true,
			MBPS:           8 * float32(tcp.BytesReceived) / float32(tcp.ElapsedTime),
			LossRate:       nil, // Not able to calculate loss rate for upload
			MinRTT:         &row.minRTT,
			HasAccessToken: u.HasAccessToken,
		}
		emit(&row.FetchedResult)
	}
}

// walkTar calls fn for each regular file of a .tgz stream. Errors returned by fn are
// per-test-file problems: they are counted in badFiles and the walk continues. If the
// error was really caused by the outer stream, the next tar.Next fails (tar and gzip
// readers keep their error) and the whole tarball fails, to be retried.
func walkTar(r io.Reader, badFiles *int64, fn func(hdr *tar.Header, r io.Reader) error) error {
	gzf, err := gzip.NewReader(r)
	if err != nil {
		return fmt.Errorf("gzip: %w", err)
	}
	defer gzf.Close()
	return walkTarReader(gzf, badFiles, fn)
}

// walkTarReader is walkTar over an already decompressed tar stream.
func walkTarReader(gzf io.Reader, badFiles *int64, fn func(hdr *tar.Header, r io.Reader) error) error {
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
			if innerErr := fn(header, tarReader); innerErr != nil {
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
	p := new(tarballParser)
	return walkTar(r, badFiles, func(hdr *tar.Header, r io.Reader) error {
		return p.ndt7(emit, hdr, r)
	})
}

// ndt5 parses the NDT5 format and pushes two rows into the storage, one for upload and
// another for download data.
func (p *tarballParser) ndt5(emit emitFunc, hdr *tar.Header, r io.Reader) error {
	if err := p.entry(hdr, r, false); err != nil {
		return fmt.Errorf("fetcher.innerNdt5Reader rErr: %v", err)
	}

	var m ndt5.NDT5Result
	jErr := json.Unmarshal(p.buf, &m)
	if jErr != nil {
		return fmt.Errorf("fetcher.innerNdt5Reader jErr: %v", jErr)
	}

	// Check if Upload Data is recorded
	if m.C2S != nil && m.C2S.Error == "" {
		row := &fetchedRow{}
		var ptrMinRTT *float32
		if m.S2C != nil {
			// C2S doesn't have RTT information. We use S2C instead
			row.minRTT = float32(m.S2C.MinRTT.Milliseconds()) / 1000
			ptrMinRTT = &row.minRTT
		}

		row.FetchedResult = models.FetchedResult{
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
		}
		emit(&row.FetchedResult)
	}

	// Check if Download Data is recorded
	if m.S2C != nil && m.S2C.Error == "" {
		row := &fetchedRow{}
		var ptrLossRate *float32
		if m.S2C.TCPInfo != nil {
			row.lossRate = float32(m.S2C.TCPInfo.BytesRetrans) / float32(m.S2C.TCPInfo.BytesSent)
			ptrLossRate = &row.lossRate
		}

		row.minRTT = float32(m.S2C.MinRTT.Milliseconds()) / 1000
		row.FetchedResult = models.FetchedResult{
			Id:             m.S2C.UUID,
			TestStyle:      "ndt5",
			IP:             m.ClientIP,
			StartedAt:      m.S2C.StartTime.Unix(),
			Upload:         false,
			MBPS:           float32(m.S2C.MeanThroughputMbps),
			LossRate:       ptrLossRate,
			MinRTT:         &row.minRTT,
			HasAccessToken: false,
			AccessTokenSig: nil,
		}
		emit(&row.FetchedResult)
	}

	return nil
}

func processNdt5Reader(emit emitFunc, r io.Reader, badFiles *int64) error {
	p := new(tarballParser)
	return walkTar(r, badFiles, func(hdr *tar.Header, r io.Reader) error {
		return p.ndt5(emit, hdr, r)
	})
}

// web100 snaplogs carry no test id. The id is a UUIDv5 of the archive path and the file
// name inside it, so refetching a day yields the same ids (it used to be a random UUIDv4,
// which made re-ingesting a web100 day impossible to deduplicate).
func web100ID(tarballPath, filename string) string {
	return uuid.NewV5(uuid.NamespaceURL, "gs://"+mlabBucket+"/"+tarballPath+"#"+filename).String()
}

func processWeb100Reader(emit emitFunc, tarballPath string, r io.Reader, badFiles *int64) error {
	iterator, err := readTgz(r, ".c2s_snaplog", ".s2c_snaplog")
	if err != nil {
		return fmt.Errorf("fetcher.processWeb100Reader readTgz: %w", err)
	}

	defer func() { atomic.AddInt64(badFiles, iterator.bad) }()
	for filename, fReader, err := iterator.Next(); fReader != nil || err != nil; filename, fReader, err = iterator.Next() {
		if err != nil {
			return fmt.Errorf("fetcher.processWeb100Reader Next: %w", err)
		}
		ext := filepath.Ext(filename)
		id := web100ID(tarballPath, filename)
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
				Id:             id,
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
				Id:             id,
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

func parseTarball(tt testType, path string, emit emitFunc, r io.Reader, badFiles *int64) error {
	switch tt {
	case NDT7TestType:
		return processNdt7Reader(emit, r, badFiles)
	case NDT5TestType:
		return processNdt5Reader(emit, r, badFiles)
	case Web100TestType:
		return processWeb100Reader(emit, path, r, badFiles)
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
	return retryFrom(ctx, opts, 1, nil, what, retries, fn)
}

// retryFrom runs fn as attempt number first (1-based; prevErr is the error of the
// attempts already made) and retries it with backoff until it succeeds or opts.Attempts
// attempts were made in total.
func retryFrom(ctx context.Context, opts Options, first int, prevErr error, what string, retries *int64, fn func() error) error {
	err := prevErr
	for i := first - 1; i < opts.Attempts; i++ {
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

// ListTarballs lists the archive tarballs of date, per test type, retrying failed
// listings. The prefixes are listed concurrently.
func ListTarballs(ctx context.Context, src ObjectSource, date time.Time, opts Options) (map[testType][]string, error) {
	opts = opts.withDefaults()
	prefixes := map[testType][]string{
		Web100TestType: {web100SearchPrefix(date)},
		NDT5TestType:   {ndt5SearchPrefix(date)},
		NDT7TestType:   ndt7SearchPrefixes(date),
	}
	listed := map[testType][][]string{}
	for tt, p := range prefixes {
		listed[tt] = make([][]string, len(p))
	}
	var retries int64
	g, gctx := errgroup.WithContext(ctx)
	for _, tt := range []testType{Web100TestType, NDT5TestType, NDT7TestType} {
		for i, prefix := range prefixes[tt] {
			slot := &listed[tt][i]
			g.Go(func() error {
				var names []string
				err := withRetries(gctx, opts, "list "+prefix, &retries, func() error {
					var lErr error
					names, lErr = src.List(gctx, prefix)
					return lErr
				})
				if err != nil {
					return err
				}
				*slot = names
				return nil
			})
		}
	}
	if err := g.Wait(); err != nil {
		return nil, err
	}
	out := map[testType][]string{}
	for tt, parts := range listed {
		for _, names := range parts {
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

// downloaded is a tarball held in memory between the download and the parse pool.
type downloaded struct {
	tarball
	data   []byte
	weight int64 // what it holds of the MaxBufferedBytes budget
}

// FetchDate downloads every tarball of date from the archive, flattens the tests and
// writes them to ds.
//
// Downloads and parsing are decoupled: opts.DownloadWorkers goroutines download tarballs
// into memory (bounded by opts.MaxBufferedBytes) and opts.Workers goroutines parse them,
// so a slow link does not idle the cores and slow parsing does not idle the link. Each
// tarball is parsed completely before its rows are written, so a retry never duplicates
// rows: a download that fails is retried by the download pool; a tarball that downloaded
// but does not parse (corrupt transfer) is downloaded and parsed again by the parse
// worker, within the same opts.Attempts budget. If a tarball still fails after
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

	var (
		mu        sync.Mutex
		firstErr  error
		completed int64
		budget    = semaphore.NewWeighted(opts.MaxBufferedBytes)
	)
	fail := func(err error) {
		mu.Lock()
		if firstErr == nil {
			firstErr = err
		}
		mu.Unlock()
		cancel()
	}

	// download reads one tarball into memory, holding its size of the buffer budget
	// (the whole budget at most) from before the first byte until release.
	download := func(item tarball) (*downloaded, error) {
		actx, acancel := context.WithTimeout(ctx, opts.TarballTimeout)
		defer acancel()
		r, err := src.Open(actx, item.path)
		if err != nil {
			return nil, err
		}
		defer r.Close()
		d := &downloaded{tarball: item}
		size := int64(-1)
		if s, ok := r.(interface{ Size() int64 }); ok {
			size = s.Size()
		}
		if size >= 0 {
			d.weight = min(size, opts.MaxBufferedBytes)
			if err := budget.Acquire(ctx, d.weight); err != nil {
				return nil, err
			}
			d.data = make([]byte, 0, size)
		}
		d.data, err = readAllInto(d.data, r)
		if err != nil {
			budget.Release(d.weight)
			return nil, err
		}
		if size < 0 {
			d.weight = min(int64(len(d.data)), opts.MaxBufferedBytes)
			if err := budget.Acquire(ctx, d.weight); err != nil {
				return nil, err
			}
		}
		return d, nil
	}
	release := func(d *downloaded) {
		budget.Release(d.weight)
		d.data = nil
	}

	writer := datastorewriter.NewWriter(ds)
	parse := func(d *downloaded) ([]*models.FetchedResult, int64, error) {
		var rows []*models.FetchedResult
		var badFiles int64
		err := parseTarball(d.testType, d.path, func(fr *models.FetchedResult) { rows = append(rows, fr) }, bytes.NewReader(d.data), &badFiles)
		return rows, badFiles, err
	}

	dlCh := make(chan tarball)
	parseCh := make(chan *downloaded, opts.Workers)
	var dlWG, parseWG sync.WaitGroup
	for i := 0; i < opts.DownloadWorkers; i++ {
		dlWG.Add(1)
		go func() {
			defer dlWG.Done()
			for item := range dlCh {
				var d *downloaded
				err := withRetries(ctx, opts, item.path, &stats.Retries, func() error {
					var dErr error
					d, dErr = download(item)
					return dErr
				})
				if err != nil {
					if !errors.Is(err, context.Canceled) {
						fail(err)
					}
					continue
				}
				select {
				case parseCh <- d:
				case <-ctx.Done():
					release(d)
				}
			}
		}()
	}
	for i := 0; i < opts.Workers; i++ {
		parseWG.Add(1)
		go func() {
			defer parseWG.Done()
			for d := range parseCh {
				if ctx.Err() != nil {
					release(d)
					continue
				}
				rows, badFiles, err := parse(d)
				release(d)
				if err != nil {
					if ctx.Err() != nil {
						continue
					}
					log.Printf("Fetch - %s failed (attempt 1/%d): %v", d.path, opts.Attempts, err)
					err = retryFrom(ctx, opts, 2, err, d.path, &stats.Retries, func() error {
						nd, dErr := download(d.tarball)
						if dErr != nil {
							return dErr
						}
						rows, badFiles, dErr = parse(nd)
						release(nd)
						return dErr
					})
				}
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
				stats.Processed[string(d.testType)]++
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
		case dlCh <- item:
		case <-ctx.Done():
			break FEED
		}
	}
	close(dlCh)
	dlWG.Wait()
	close(parseCh)
	parseWG.Wait()
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
