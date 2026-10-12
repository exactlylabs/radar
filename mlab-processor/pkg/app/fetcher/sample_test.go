package fetcher

// Tests over a local sample of real M-Lab archive tarballs. They are skipped unless
// MLAB_SAMPLE_DIR points at a directory tree holding the tarballs under their archive
// paths (ndt/ndt7/..., ndt/ndt5/..., ndt/web100/...), as downloaded from
// gs://archive-measurement-lab. Example:
//
//	MLAB_SAMPLE_DIR=/tmp/claude-processor-perf/data MLAB_SAMPLE_WORKERS=4 \
//	  go test ./pkg/app/fetcher -run 'TestSample' -v -count=1 -cpuprofile cpu.out
//
// TestSampleThroughput reports MB/s of compressed input per wall second and per CPU
// second (the figure that matters for a CPU-bound fetch), and tests/s.
// TestSampleReferenceParsers runs the reference parsers (the pre-v2 full json.Unmarshal
// for ndt7, a copy of the v2 code for ndt5) and the current ones over every test file
// and requires identical rows.

import (
	"archive/tar"
	"bytes"
	stdgzip "compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"math"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"testing"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt5"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
)

type sampleTarball struct {
	path string // archive path (relative to the sample dir)
	file string // local file
	tt   testType
	size int64
}

func sampleTarballs(t testing.TB) []sampleTarball {
	dir := os.Getenv("MLAB_SAMPLE_DIR")
	if dir == "" {
		t.Skip("MLAB_SAMPLE_DIR not set")
	}
	var out []sampleTarball
	err := filepath.WalkDir(dir, func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(p, ".tgz") {
			return err
		}
		rel, _ := filepath.Rel(dir, p)
		rel = filepath.ToSlash(rel)
		var tt testType
		switch {
		case strings.HasPrefix(rel, "ndt/ndt7/"):
			tt = NDT7TestType
		case strings.HasPrefix(rel, "ndt/ndt5/"):
			tt = NDT5TestType
		case strings.HasPrefix(rel, "ndt/web100/"):
			tt = Web100TestType
		default:
			return nil
		}
		info, err := d.Info()
		if err != nil {
			return err
		}
		out = append(out, sampleTarball{path: rel, file: p, tt: tt, size: info.Size()})
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(out) == 0 {
		t.Skipf("no tarballs under %s", dir)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].path < out[j].path })
	if only := os.Getenv("MLAB_SAMPLE_TYPE"); only != "" {
		var f []sampleTarball
		for _, s := range out {
			if string(s.tt) == only {
				f = append(f, s)
			}
		}
		out = f
	}
	return out
}

func cpuSeconds() float64 {
	var ru syscall.Rusage
	syscall.Getrusage(syscall.RUSAGE_SELF, &ru)
	return float64(ru.Utime.Sec) + float64(ru.Utime.Usec)/1e6 + float64(ru.Stime.Sec) + float64(ru.Stime.Usec)/1e6
}

// runSample parses every tarball with workers goroutines and returns the rows per tarball.
func runSample(t testing.TB, tarballs []sampleTarball, workers int, parse func(s sampleTarball, emit emitFunc, r io.Reader) error) (map[string][]*models.FetchedResult, int64) {
	var (
		mu       sync.Mutex
		rows     = map[string][]*models.FetchedResult{}
		badFiles int64
		wg       sync.WaitGroup
		ch       = make(chan sampleTarball)
	)
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for s := range ch {
				data, err := os.ReadFile(s.file) // like FetchDate: parse from memory
				if err != nil {
					t.Error(err)
					continue
				}
				var out []*models.FetchedResult
				err = parse(s, func(fr *models.FetchedResult) { out = append(out, fr) }, bytes.NewReader(data))
				if err != nil {
					t.Errorf("%s: %v", s.path, err)
					continue
				}
				mu.Lock()
				rows[s.path] = out
				mu.Unlock()
			}
		}()
	}
	for _, s := range tarballs {
		ch <- s
	}
	close(ch)
	wg.Wait()
	return rows, atomic.LoadInt64(&badFiles)
}

func currentParse(badFiles *int64) func(s sampleTarball, emit emitFunc, r io.Reader) error {
	return func(s sampleTarball, emit emitFunc, r io.Reader) error {
		return parseTarball(s.tt, s.path, emit, r, badFiles)
	}
}

func TestSampleThroughput(t *testing.T) {
	tarballs := sampleTarballs(t)
	workers := runtime.NumCPU()
	if w, _ := strconv.Atoi(os.Getenv("MLAB_SAMPLE_WORKERS")); w > 0 {
		workers = w
	}
	var bytesTotal int64
	for _, s := range tarballs {
		bytesTotal += s.size
	}
	var badFiles int64
	runtime.GC()
	cpu0, wall0 := cpuSeconds(), time.Now()
	rows, _ := runSample(t, tarballs, workers, currentParse(&badFiles))
	wall, cpu := time.Since(wall0).Seconds(), cpuSeconds()-cpu0
	var tests int64
	for _, r := range rows {
		tests += int64(len(r))
	}
	mb := float64(bytesTotal) / 1e6
	msg := fmt.Sprintf("sample: %d tarballs, %.1f MB compressed, %d tests, %d bad files, %d workers\n"+
		"  wall %.2fs  cpu %.2fs (%.2f cores busy)\n"+
		"  %.1f MB/s wall, %.1f MB/s per core, %.0f tests/s wall, %.0f tests/s per core",
		len(tarballs), mb, tests, badFiles, workers, wall, cpu, cpu/wall,
		mb/wall, mb/cpu, float64(tests)/wall, float64(tests)/cpu)
	t.Log(msg)
	fmt.Fprintln(os.Stderr, msg)
}

// ---- reference parsers (frozen copies) ----

// referenceNdt7Tarball is the pre-v2 path: stdlib gzip for the tarball and every test
// file, io.ReadAll + json.Unmarshal into the full ndt7.NDT7Result.
func referenceNdt7Tarball(emit emitFunc, r io.Reader, badFiles *int64) error {
	gzf, err := stdgzip.NewReader(r)
	if err != nil {
		return err
	}
	return walkTarReader(gzf, badFiles, func(hdr *tar.Header, r io.Reader) error {
		return legacyInnerNdt7(emit, r)
	})
}

// referenceInnerNdt5 is the v2 ndt5 parser (io.ReadAll + json.Unmarshal into ndt5.NDT5Result).
func referenceInnerNdt5(emit emitFunc, reader io.Reader) error {
	b, rErr := io.ReadAll(reader)
	if rErr != nil {
		return rErr
	}
	var m ndt5.NDT5Result
	if jErr := json.Unmarshal(b, &m); jErr != nil {
		return jErr
	}
	if m.C2S != nil && m.C2S.Error == "" {
		var ptrMinRTT *float32
		if m.S2C != nil {
			minRtt := float32(m.S2C.MinRTT.Milliseconds()) / 1000
			ptrMinRTT = &minRtt
		}
		emit(&models.FetchedResult{Id: m.C2S.UUID, TestStyle: "ndt5", IP: m.ClientIP, StartedAt: m.C2S.StartTime.Unix(),
			Upload: true, MBPS: float32(m.C2S.MeanThroughputMbps), MinRTT: ptrMinRTT})
	}
	if m.S2C != nil && m.S2C.Error == "" {
		var ptrLossRate *float32
		if m.S2C.TCPInfo != nil {
			lossRate := float32(m.S2C.TCPInfo.BytesRetrans) / float32(m.S2C.TCPInfo.BytesSent)
			ptrLossRate = &lossRate
		}
		minRtt := float32(m.S2C.MinRTT.Milliseconds()) / 1000
		emit(&models.FetchedResult{Id: m.S2C.UUID, TestStyle: "ndt5", IP: m.ClientIP, StartedAt: m.S2C.StartTime.Unix(),
			MBPS: float32(m.S2C.MeanThroughputMbps), LossRate: ptrLossRate, MinRTT: &minRtt})
	}
	return nil
}

func referenceNdt5Tarball(emit emitFunc, r io.Reader, badFiles *int64) error {
	gzf, err := stdgzip.NewReader(r)
	if err != nil {
		return err
	}
	return walkTarReader(gzf, badFiles, func(hdr *tar.Header, r io.Reader) error {
		return referenceInnerNdt5(emit, r)
	})
}

func referenceParse(badFiles *int64) func(s sampleTarball, emit emitFunc, r io.Reader) error {
	return func(s sampleTarball, emit emitFunc, r io.Reader) error {
		switch s.tt {
		case NDT7TestType:
			return referenceNdt7Tarball(emit, r, badFiles)
		case NDT5TestType:
			return referenceNdt5Tarball(emit, r, badFiles)
		default:
			return processWeb100Reader(emit, s.path, r, badFiles)
		}
	}
}

func f32Equal(a, b float32) bool {
	return a == b || (math.IsNaN(float64(a)) && math.IsNaN(float64(b)))
}

func f32PtrEqual(a, b *float32) bool {
	if a == nil || b == nil {
		return a == nil && b == nil
	}
	return f32Equal(*a, *b)
}

func strPtrEqual(a, b *string) bool {
	if a == nil || b == nil {
		return a == nil && b == nil
	}
	return *a == *b
}

func sameRow(a, b *models.FetchedResult) bool {
	return a.Id == b.Id && a.TestStyle == b.TestStyle && a.IP == b.IP && a.StartedAt == b.StartedAt &&
		a.Upload == b.Upload && f32Equal(a.MBPS, b.MBPS) && f32PtrEqual(a.LossRate, b.LossRate) &&
		f32PtrEqual(a.MinRTT, b.MinRTT) && a.HasAccessToken == b.HasAccessToken && strPtrEqual(a.AccessTokenSig, b.AccessTokenSig)
}

func TestSampleReferenceParsers(t *testing.T) {
	tarballs := sampleTarballs(t)
	var badRef, badNew int64
	ref, _ := runSample(t, tarballs, runtime.NumCPU(), referenceParse(&badRef))
	got, _ := runSample(t, tarballs, runtime.NumCPU(), currentParse(&badNew))
	if badRef != badNew {
		t.Errorf("bad files: reference %d, current %d", badRef, badNew)
	}
	var rows int
	for _, s := range tarballs {
		a, b := ref[s.path], got[s.path]
		if len(a) != len(b) {
			t.Errorf("%s: reference %d rows, current %d rows", s.path, len(a), len(b))
			continue
		}
		for i := range a {
			if !sameRow(a[i], b[i]) {
				ja, _ := json.Marshal(a[i])
				jb, _ := json.Marshal(b[i])
				t.Errorf("%s row %d differs:\nreference %s\ncurrent   %s", s.path, i, ja, jb)
			}
		}
		rows += len(a)
	}
	t.Logf("%d tarballs, %d rows identical, %d bad files", len(tarballs), rows, badRef)
}

// TestSampleFetchDate runs the whole FetchDate over the sample through a local source,
// checking that the stats and the written rows agree with the direct parse.
func TestSampleFetchDate(t *testing.T) {
	tarballs := sampleTarballs(t)
	src := &dirSource{dir: os.Getenv("MLAB_SAMPLE_DIR"), tarballs: tarballs}
	ds := &memDS{}
	date, err := time.Parse("2006/01/02", strings.Join(strings.Split(tarballs[0].path, "/")[2:5], "/"))
	if err != nil {
		t.Skipf("sample path %s does not carry a post-2020 date: %v", tarballs[0].path, err)
	}
	stats, err := FetchDate(t.Context(), src, ds, date, Options{})
	if err != nil {
		t.Fatal(err)
	}
	var ofDate []sampleTarball // the sample may hold other dates (web100 ended in 2019)
	for _, s := range tarballs {
		if strings.Contains(s.path, "/"+date.Format(postSwitchFormat)+"/") {
			ofDate = append(ofDate, s)
		}
	}
	var badFiles int64
	rows, _ := runSample(t, ofDate, runtime.NumCPU(), currentParse(&badFiles))
	var n int64
	for _, r := range rows {
		n += int64(len(r))
	}
	if stats.Tests != n || int64(len(ds.items)) != n || !stats.Complete() {
		t.Fatalf("stats %+v, %d rows in store, %d rows by direct parse", stats, len(ds.items), n)
	}
	t.Logf("stats %+v", stats)
}

type dirSource struct {
	dir      string
	tarballs []sampleTarball
}

func (d *dirSource) List(ctx context.Context, prefix string) ([]string, error) {
	var out []string
	for _, s := range d.tarballs {
		if strings.HasPrefix(s.path, prefix) {
			out = append(out, s.path)
		}
	}
	return out, nil
}

func (d *dirSource) Open(ctx context.Context, path string) (io.ReadCloser, error) {
	return os.Open(filepath.Join(d.dir, filepath.FromSlash(path)))
}

// TestSampleLiveFetch runs FetchDate against the real archive bucket, restricted to the
// sample's object names, to measure the download pool + parse pipeline end to end. It
// needs the network and MLAB_SAMPLE_LIVE=1.
func TestSampleLiveFetch(t *testing.T) {
	tarballs := sampleTarballs(t)
	if os.Getenv("MLAB_SAMPLE_LIVE") == "" {
		t.Skip("MLAB_SAMPLE_LIVE not set")
	}
	src, closer, err := NewMLabSource(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	defer closer.Close()
	names := map[string]bool{}
	var bytesTotal int64
	for _, s := range tarballs {
		names[s.path] = true
		bytesTotal += s.size
	}
	date, err := time.Parse("2006/01/02", strings.Join(strings.Split(tarballs[0].path, "/")[2:5], "/"))
	if err != nil {
		t.Skip(err)
	}
	opts := Options{}
	if w, _ := strconv.Atoi(os.Getenv("MLAB_SAMPLE_WORKERS")); w > 0 {
		opts.Workers = w
	}
	if w, _ := strconv.Atoi(os.Getenv("MLAB_SAMPLE_DOWNLOAD_WORKERS")); w > 0 {
		opts.DownloadWorkers = w
	}
	ds := &memDS{}
	cpu0, wall0 := cpuSeconds(), time.Now()
	stats, err := FetchDate(t.Context(), &filteredSource{src, names}, ds, date, opts)
	wall, cpu := time.Since(wall0).Seconds(), cpuSeconds()-cpu0
	if err != nil {
		t.Fatal(err)
	}
	opts = opts.withDefaults()
	msg := fmt.Sprintf("live fetch: %d tarballs, %.1f MB, %d tests, %d parse workers, %d download workers\n"+
		"  wall %.2fs cpu %.2fs (%.2f cores busy): %.1f MB/s wall, %.1f MB/s per core, stats %+v",
		stats.TotalProcessed(), float64(bytesTotal)/1e6, stats.Tests, opts.Workers, opts.DownloadWorkers,
		wall, cpu, cpu/wall, float64(bytesTotal)/1e6/wall, float64(bytesTotal)/1e6/cpu, stats)
	t.Log(msg)
	fmt.Fprintln(os.Stderr, msg)
}

// filteredSource lists only the names of a set.
type filteredSource struct {
	ObjectSource
	names map[string]bool
}

func (f *filteredSource) List(ctx context.Context, prefix string) ([]string, error) {
	all, err := f.ObjectSource.List(ctx, prefix)
	if err != nil {
		return nil, err
	}
	var out []string
	for _, n := range all {
		if f.names[n] {
			out = append(out, n)
		}
	}
	return out, nil
}
