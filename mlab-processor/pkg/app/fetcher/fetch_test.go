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
	"reflect"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt5"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt7"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
)

// ---- fakes ----

type memWriter struct {
	ds *memDS
}

func (w *memWriter) Write(item any) error {
	w.ds.mu.Lock()
	defer w.ds.mu.Unlock()
	w.ds.items = append(w.ds.items, item)
	return nil
}
func (w *memWriter) Close() error { return nil }

type memDS struct {
	mu    sync.Mutex
	items []any
}

func (m *memDS) ItemWriter() (datastore.ItemWriter, error)         { return &memWriter{m}, nil }
func (m *memDS) ItemsReader() (datastore.StoreItemIterator, error) { return nil, errors.New("n/a") }
func (m *memDS) FileReader() (io.ReadCloser, error)                { return nil, errors.New("n/a") }
func (m *memDS) FileName() string                                  { return "mem" }
func (m *memDS) Delete() error                                     { return nil }
func (m *memDS) Exists() (bool, error)                             { return false, nil }
func (m *memDS) Flush() error                                      { return nil }
func (m *memDS) Clear() error                                      { return nil }

func (m *memDS) ids() []string {
	var out []string
	for _, it := range m.items {
		out = append(out, it.(*models.FetchedResult).Id)
	}
	sort.Strings(out)
	return out
}

type fakeSource struct {
	mu      sync.Mutex
	objects map[string][]byte
	// failOpens[path] = number of Open calls that fail before succeeding (-1 = always)
	failOpens map[string]int
	// truncate[path] = number of Opens that return a truncated stream
	truncate  map[string]int
	failLists int
	opens     map[string]int
}

func newFakeSource() *fakeSource {
	return &fakeSource{objects: map[string][]byte{}, failOpens: map[string]int{}, truncate: map[string]int{}, opens: map[string]int{}}
}

func (f *fakeSource) List(ctx context.Context, prefix string) ([]string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.failLists > 0 {
		f.failLists--
		return nil, errors.New("listing failed")
	}
	var out []string
	for k := range f.objects {
		if strings.HasPrefix(k, prefix) {
			out = append(out, k)
		}
	}
	sort.Strings(out)
	return out, nil
}

func (f *fakeSource) Open(ctx context.Context, path string) (io.ReadCloser, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.opens[path]++
	if n := f.failOpens[path]; n != 0 {
		if n > 0 {
			f.failOpens[path]--
		}
		return nil, fmt.Errorf("open %s: 503", path)
	}
	b, ok := f.objects[path]
	if !ok {
		return nil, errors.New("404")
	}
	if f.truncate[path] > 0 {
		f.truncate[path]--
		return io.NopCloser(bytes.NewReader(b[:len(b)/2])), nil
	}
	return io.NopCloser(bytes.NewReader(b)), nil
}

// ---- builders ----

func gz(b []byte) []byte {
	var buf bytes.Buffer
	w := gzip.NewWriter(&buf)
	w.Write(b)
	w.Close()
	return buf.Bytes()
}

func tgz(files map[string][]byte) []byte {
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gw)
	names := make([]string, 0, len(files))
	for n := range files {
		names = append(names, n)
	}
	sort.Strings(names)
	tw.WriteHeader(&tar.Header{Name: "dir/", Typeflag: tar.TypeDir, Mode: 0755})
	for _, n := range names {
		tw.WriteHeader(&tar.Header{Name: n, Typeflag: tar.TypeReg, Mode: 0644, Size: int64(len(files[n]))})
		tw.Write(files[n])
	}
	tw.Close()
	gw.Close()
	return buf.Bytes()
}

func tcp(acked, received, sent, retrans int64, minRTT uint32, elapsed int64) *ndt7.TCPInfo {
	t := &ndt7.TCPInfo{ElapsedTime: elapsed}
	t.BytesAcked, t.BytesReceived, t.BytesSent, t.BytesRetrans, t.MinRTT = acked, received, sent, retrans, minRTT
	return t
}

func ndt7JSON(i int) []byte {
	start := time.Date(2026, 7, 31, 1, 2, 3, 0, time.UTC).Add(time.Duration(i) * time.Minute)
	r := ndt7.NDT7Result{
		ClientIP:  fmt.Sprintf("10.0.%d.%d", i/256, i%256),
		StartTime: start,
		Download: &ndt7.ArchivalData{
			UUID:      fmt.Sprintf("ndt-x_%d_down", i),
			StartTime: start,
			ServerMeasurements: []ndt7.Measurement{
				{TCPInfo: tcp(100, 0, 100, 1, 5000, 1000)},
				{AppInfo: &ndt7.AppInfo{NumBytes: 5}},
				{TCPInfo: tcp(int64(1000000+i), 0, 1100000, int64(i), uint32(20000+i), 10000000)},
			},
			ClientMeasurements: []ndt7.Measurement{{AppInfo: &ndt7.AppInfo{NumBytes: 9}}},
		},
		Upload: &ndt7.ArchivalData{
			UUID:      fmt.Sprintf("ndt-x_%d_up", i),
			StartTime: start.Add(time.Second),
			ServerMeasurements: []ndt7.Measurement{
				{TCPInfo: tcp(0, int64(500000+i), 0, 0, uint32(30000+i), 10000000)},
			},
			ClientMetadata: []ndt.NameValue{{Name: "access_token", Value: "a.b.sig"}},
		},
	}
	switch i % 5 {
	case 1: // last measurement without TCPInfo: no download row
		r.Download.ServerMeasurements = append(r.Download.ServerMeasurements, ndt7.Measurement{AppInfo: &ndt7.AppInfo{}})
	case 2: // no upload
		r.Upload = nil
	case 3: // empty measurements
		r.Upload.ServerMeasurements = nil
	}
	b, _ := json.Marshal(r)
	return b
}

func ndt5JSON(i int) []byte {
	start := time.Date(2026, 7, 31, 4, 0, 0, 0, time.UTC).Add(time.Duration(i) * time.Minute)
	r := ndt5.NDT5Result{
		ClientIP: fmt.Sprintf("2001:db8::%x", i),
		C2S:      &ndt5.C2S{UUID: fmt.Sprintf("ndt5_%d_c2s", i), StartTime: start, MeanThroughputMbps: float64(i) + 0.5},
		S2C: &ndt5.S2C{UUID: fmt.Sprintf("ndt5_%d_s2c", i), StartTime: start, MeanThroughputMbps: float64(i) * 2,
			MinRTT: time.Duration(i+3) * time.Millisecond, TCPInfo: &ndt.LinuxTCPInfo{BytesRetrans: 3, BytesSent: 100}},
	}
	if i%4 == 1 {
		r.S2C.Error = "boom"
	}
	b, _ := json.Marshal(r)
	return b
}

const day = "2026/07/31"

func buildSource(nNdt7, nNdt5, testsPer int) *fakeSource {
	src := newFakeSource()
	k := 0
	for t := 0; t < nNdt7; t++ {
		files := map[string][]byte{}
		for j := 0; j < testsPer; j++ {
			files[fmt.Sprintf("dir/t%d.json.gz", k)] = gz(ndt7JSON(k))
			k++
		}
		src.objects[fmt.Sprintf("ndt/ndt7/%s/tar%03d.tgz", day, t)] = tgz(files)
	}
	for t := 0; t < nNdt5; t++ {
		files := map[string][]byte{}
		for j := 0; j < testsPer; j++ {
			files[fmt.Sprintf("dir/t%d.json", k)] = ndt5JSON(k)
			k++
		}
		src.objects[fmt.Sprintf("ndt/ndt5/%s/tar%03d.tgz", day, t)] = tgz(files)
	}
	return src
}

var testDate = time.Date(2026, 7, 31, 0, 0, 0, 0, time.UTC)

func fastOpts() Options {
	return Options{Workers: 4, Attempts: 3, Backoff: time.Millisecond}
}

// ---- tests ----

func TestFetchDateComplete(t *testing.T) {
	src := buildSource(6, 3, 10)
	ds := &memDS{}
	stats, err := FetchDate(context.Background(), src, ds, testDate, fastOpts())
	if err != nil {
		t.Fatal(err)
	}
	if stats.TotalListed() != 9 || stats.TotalProcessed() != 9 || !stats.Complete() {
		t.Fatalf("stats %+v", stats)
	}
	if stats.Tests != int64(len(ds.items)) {
		t.Fatalf("tests %d, items %d", stats.Tests, len(ds.items))
	}
	// expected rows: per ndt7 test: down unless i%5==1, up unless i%5 in (2,3); ndt5: c2s always, s2c unless i%4==1
	want := 0
	for k := 0; k < 60; k++ {
		if k%5 != 1 {
			want++
		}
		if k%5 != 2 && k%5 != 3 {
			want++
		}
	}
	for k := 60; k < 90; k++ {
		want++
		if k%4 != 1 {
			want++
		}
	}
	if len(ds.items) != want {
		t.Fatalf("got %d rows, want %d", len(ds.items), want)
	}
}

func TestFetchDateRetriesTransientFailures(t *testing.T) {
	src := buildSource(4, 2, 5)
	clean := &memDS{}
	if _, err := FetchDate(context.Background(), buildSource(4, 2, 5), clean, testDate, fastOpts()); err != nil {
		t.Fatal(err)
	}
	src.failOpens["ndt/ndt7/"+day+"/tar001.tgz"] = 2
	src.truncate["ndt/ndt7/"+day+"/tar002.tgz"] = 1 // fails mid-stream after emitting rows
	src.truncate["ndt/ndt5/"+day+"/tar000.tgz"] = 2
	src.failLists = 2
	ds := &memDS{}
	stats, err := FetchDate(context.Background(), src, ds, testDate, fastOpts())
	if err != nil {
		t.Fatal(err)
	}
	if !stats.Complete() || stats.Retries != 5 {
		t.Fatalf("stats %+v", stats)
	}
	// no duplicates from the partially read attempt
	if !reflect.DeepEqual(ds.ids(), clean.ids()) {
		t.Fatalf("rows differ from a clean fetch: %d vs %d", len(ds.items), len(clean.items))
	}
}

func TestFetchDateFailsAfterRetries(t *testing.T) {
	src := buildSource(8, 2, 3)
	src.failOpens["ndt/ndt7/"+day+"/tar003.tgz"] = -1
	stats, err := FetchDate(context.Background(), src, &memDS{}, testDate, fastOpts())
	if err == nil {
		t.Fatal("expected an error")
	}
	if !strings.Contains(err.Error(), "tar003") || stats.Complete() {
		t.Fatalf("err %v stats %+v", err, stats)
	}
	if src.opens["ndt/ndt7/"+day+"/tar003.tgz"] != 3 {
		t.Fatalf("expected 3 attempts, got %d", src.opens["ndt/ndt7/"+day+"/tar003.tgz"])
	}
}

func TestFetchDateFailsWhenListingFails(t *testing.T) {
	src := buildSource(1, 1, 1)
	src.failLists = 100
	if _, err := FetchDate(context.Background(), src, &memDS{}, testDate, fastOpts()); err == nil {
		t.Fatal("expected an error")
	}
}

func TestFetchDateFailsWhenNothingListed(t *testing.T) {
	if _, err := FetchDate(context.Background(), newFakeSource(), &memDS{}, testDate, fastOpts()); err == nil {
		t.Fatal("expected an error for an empty day")
	}
}

func TestFetchDateCancelled(t *testing.T) {
	src := buildSource(4, 0, 1)
	src.failOpens["ndt/ndt7/"+day+"/tar000.tgz"] = -1
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := FetchDate(ctx, src, &memDS{}, testDate, Options{Workers: 1, Attempts: 3, Backoff: time.Hour}); err == nil {
		t.Fatal("expected an error")
	}
}

func TestBadInnerFileIsSkippedNotFatal(t *testing.T) {
	src := newFakeSource()
	src.objects["ndt/ndt7/"+day+"/a.tgz"] = tgz(map[string][]byte{
		"dir/a.json.gz": gz(ndt7JSON(0)),
		"dir/b.json.gz": gz([]byte("{not json")),
		"dir/c.json.gz": []byte("not gzip"),
		"dir/d.json.gz": gz(ndt7JSON(4)),
	})
	ds := &memDS{}
	stats, err := FetchDate(context.Background(), src, ds, testDate, fastOpts())
	if err != nil {
		t.Fatal(err)
	}
	if stats.BadFiles != 2 || len(ds.items) != 4 {
		t.Fatalf("stats %+v rows %d", stats, len(ds.items))
	}
}

// legacyInnerNdt7 is the pre-v2 parser (whole JSON into ndt7.NDT7Result).
func legacyInnerNdt7(emit emitFunc, reader io.Reader) error {
	g, err := gzip.NewReader(reader)
	if err != nil {
		return err
	}
	defer g.Close()
	b, err := io.ReadAll(g)
	if err != nil {
		return err
	}
	var m ndt7.NDT7Result
	if err := json.Unmarshal(b, &m); err != nil {
		return err
	}
	if m.Download != nil && len(m.Download.ServerMeasurements) > 0 {
		l := len(m.Download.ServerMeasurements)
		if m.Download.ServerMeasurements[l-1].TCPInfo != nil {
			ti := m.Download.ServerMeasurements[l-1].TCPInfo
			mbps := 8 * float32(ti.BytesAcked) / float32(ti.ElapsedTime)
			lossRate := float32(ti.BytesRetrans) / float32(ti.BytesSent)
			rtt := float32(ti.MinRTT) / 1000
			emit(&models.FetchedResult{Id: m.Download.UUID, TestStyle: "ndt7", IP: m.ClientIP, StartedAt: m.Download.StartTime.Unix(),
				MBPS: mbps, LossRate: &lossRate, MinRTT: &rtt, HasAccessToken: accessSigFromClientMetadata(m.Download.ClientMetadata) != nil})
		}
	}
	if m.Upload != nil && len(m.Upload.ServerMeasurements) > 0 {
		l := len(m.Upload.ServerMeasurements)
		if m.Upload.ServerMeasurements[l-1].TCPInfo != nil {
			ti := m.Upload.ServerMeasurements[l-1].TCPInfo
			mbps := 8 * float32(ti.BytesReceived) / float32(ti.ElapsedTime)
			rtt := float32(ti.MinRTT) / 1000
			emit(&models.FetchedResult{Id: m.Upload.UUID, TestStyle: "ndt7", IP: m.ClientIP, StartedAt: m.Upload.StartTime.Unix(),
				Upload: true, MBPS: mbps, MinRTT: &rtt, HasAccessToken: accessSigFromClientMetadata(m.Upload.ClientMetadata) != nil})
		}
	}
	return nil
}

func TestNdt7LeanParserMatchesLegacy(t *testing.T) {
	inputs := [][]byte{
		[]byte(`{"ClientIP":"1.2.3.4","Download":{"UUID":"x","StartTime":"2026-07-31T00:00:00Z","ServerMeasurements":null}}`),
		[]byte(`{"ClientIP":"1.2.3.4","Download":{"UUID":"x","StartTime":"2026-07-31T00:00:00Z","ServerMeasurements":[]}}`),
		[]byte(`{"clientip":"1.2.3.4","download":{"uuid":"y","starttime":"2026-07-31T00:00:00Z","servermeasurements":[{"tcpinfo":{"BytesAcked":10,"ElapsedTime":5,"BytesSent":4,"MinRTT":7}}]}}`),
		[]byte(`{"ClientIP":"1.2.3.4","Upload":{"UUID":"z","ServerMeasurements":[{"TCPInfo":null}]}}`),
	}
	for i := 0; i < 50; i++ {
		inputs = append(inputs, ndt7JSON(i))
	}
	for i, in := range inputs {
		var a, b []*models.FetchedResult
		errA := legacyInnerNdt7(func(r *models.FetchedResult) { a = append(a, r) }, bytes.NewReader(gz(in)))
		errB := innerNdt7GzipReader(func(r *models.FetchedResult) { b = append(b, r) }, bytes.NewReader(gz(in)), new(gzip.Reader))
		if (errA == nil) != (errB == nil) {
			t.Fatalf("input %d: legacy err %v, new err %v", i, errA, errB)
		}
		if !reflect.DeepEqual(a, b) {
			ja, _ := json.Marshal(a)
			jb, _ := json.Marshal(b)
			t.Fatalf("input %d differs:\nlegacy %s\nnew    %s", i, ja, jb)
		}
	}
}
