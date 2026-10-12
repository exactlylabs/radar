package pipeline_test

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher"
	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt5"
	"github.com/exactlylabs/mlab-processor/pkg/app/helpers/flavors"
	"github.com/exactlylabs/mlab-processor/pkg/app/models"
	"github.com/exactlylabs/mlab-processor/pkg/app/pipeline"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore"
	"github.com/exactlylabs/mlab-processor/pkg/services/datastore/localstorage"
	"github.com/exactlylabs/mlab-processor/pkg/services/encoders/avro"
	shp "github.com/jonas-p/go-shp"
)

type source struct {
	mu       sync.Mutex
	objects  map[string][]byte
	failOpen map[string]bool
}

func (s *source) List(ctx context.Context, prefix string) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var out []string
	for k := range s.objects {
		if strings.HasPrefix(k, prefix) {
			out = append(out, k)
		}
	}
	sort.Strings(out)
	return out, nil
}

func (s *source) Open(ctx context.Context, path string) (io.ReadCloser, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.failOpen[path] {
		return nil, errors.New("503")
	}
	return io.NopCloser(bytes.NewReader(s.objects[path])), nil
}

// tarball builds an ndt5 tarball whose tests come from the given client IPs.
func tarball(t *testing.T, name string, ips ...string) []byte {
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gw)
	for i, ip := range ips {
		start := time.Date(2026, 7, 31, 1, 0, i, 0, time.UTC)
		b, _ := json.Marshal(ndt5.NDT5Result{
			ClientIP: ip,
			C2S:      &ndt5.C2S{UUID: fmt.Sprintf("%s-%d-up", name, i), StartTime: start, MeanThroughputMbps: 10},
			S2C:      &ndt5.S2C{UUID: fmt.Sprintf("%s-%d-down", name, i), StartTime: start, MeanThroughputMbps: 50, MinRTT: 20 * time.Millisecond},
		})
		tw.WriteHeader(&tar.Header{Name: fmt.Sprintf("%s/%d.json", name, i), Typeflag: tar.TypeReg, Mode: 0644, Size: int64(len(b))})
		tw.Write(b)
	}
	tw.Close()
	gw.Close()
	return buf.Bytes()
}

// flakyStorage wraps a storage and can fail HEAD requests; it counts uploads.
type flakyStorage struct {
	datastore.Storage
	failExists bool
	mu         sync.Mutex
	stored     []string
}

func (f *flakyStorage) Exists(ctx context.Context, p string) (bool, error) {
	if f.failExists {
		return false, errors.New("HEAD: 500 internal error")
	}
	return f.Storage.Exists(ctx, p)
}

func (f *flakyStorage) Store(ctx context.Context, r io.ReadSeeker, p string) error {
	f.mu.Lock()
	f.stored = append(f.stored, p)
	f.mu.Unlock()
	return f.Storage.Store(ctx, r, p)
}

func writeFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}
}

func writeShape(t *testing.T, path string) {
	t.Helper()
	w, err := shp.Create(path, shp.POLYGON)
	if err != nil {
		t.Fatal(err)
	}
	w.SetFields([]shp.Field{shp.StringField("GEOID", 2)})
	square := shp.NewPolyLine([][]shp.Point{{{X: -130, Y: 30}, {X: -130, Y: 40}, {X: -110, Y: 40}, {X: -110, Y: 30}, {X: -130, Y: 30}}})
	n := w.Write((*shp.Polygon)(square))
	w.WriteAttribute(int(n), 0, "06")
	w.Close()
	// go-shp's writer names the attribute table "<name>dbf" (no dot); the reader wants "<name>.dbf"
	base := strings.TrimSuffix(path, ".shp")
	if err := os.Rename(base+"dbf", base+".dbf"); err != nil {
		t.Fatal(err)
	}
}

type env struct {
	runner  *pipeline.Runner
	src     *source
	storage *flakyStorage
	dir     string
}

var day = time.Date(2026, 7, 31, 0, 0, 0, 0, time.UTC)

const prefix = "ndt/ndt5/2026/07/31/"

func setup(t *testing.T) *env {
	dir := t.TempDir()
	wd, _ := os.Getwd()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Chdir(wd) })

	in := filepath.Join(dir, "input")
	os.Mkdir(in, 0755)
	writeFile(t, filepath.Join(in, "city4.csv"), "network,geoname_id,latitude,longitude,accuracy_radius\n10.0.0.0/8,1,35.5,-120.25,10\n11.0.0.0/8,1,50,10,100\n")
	writeFile(t, filepath.Join(in, "city6.csv"), "network,geoname_id,latitude,longitude,accuracy_radius\n2001:db8::/32,1,36,-121,5\n")
	writeFile(t, filepath.Join(in, "asn4.csv"), "network,autonomous_system_number,autonomous_system_organization\n10.0.0.0/8,64500,TEST-AS\n")
	writeFile(t, filepath.Join(in, "asn6.csv"), "network,autonomous_system_number,autonomous_system_organization\n2001:db8::/32,64501,TEST6-AS\n")
	writeFile(t, filepath.Join(in, "caida.jsonl"), `{"name":"Test Org","organizationId":"ORG-1","type":"Organization"}
{"asn":"64500","name":"TEST-AS","organizationId":"ORG-1","type":"ASN"}
`)
	writeShape(t, filepath.Join(in, "state.shp"))
	conf := &config.ProcessorConfig{
		Ipv4DBPath:    filepath.Join(in, "city4.csv"),
		Ipv6DBPath:    filepath.Join(in, "city6.csv"),
		AsnIpv4DBPath: filepath.Join(in, "asn4.csv"),
		AsnIpv6DBPath: filepath.Join(in, "asn6.csv"),
		Asn2OrgDBPath: filepath.Join(in, "caida.jsonl"),
		// ZIP_CODES points to a missing file: it must be ignored, not loaded
		ShapePaths: "US_STATES:" + filepath.Join(in, "state.shp") + ";ZIP_CODES:" + filepath.Join(in, "missing.zip"),
	}
	local, err := localstorage.New(filepath.Join(dir, "storage"))
	if err != nil {
		t.Fatal(err)
	}
	st := &flakyStorage{Storage: local}
	src := &source{objects: map[string][]byte{
		prefix + "a.tgz": tarball(t, "a", "10.1.2.3", "11.1.1.1", "2001:db8::1"),
		prefix + "b.tgz": tarball(t, "b", "10.9.9.9", "192.0.2.1"),
	}, failOpen: map[string]bool{}}
	return &env{
		runner: &pipeline.Runner{
			Provider:  flavors.NewAvroStorageDataStoreFactory(st),
			Storage:   st,
			Conf:      conf,
			FetchOpts: fetcher.Options{Workers: 2, Attempts: 2, Backoff: time.Millisecond},
			Source:    src,
		},
		src:     src,
		storage: st,
		dir:     dir,
	}
}

func (e *env) exists(p string) bool {
	_, err := os.Stat(filepath.Join(e.dir, "storage", p))
	return err == nil
}

func readRevGeo(t *testing.T, path string) []models.RevGeoResult {
	f, err := os.Open(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	dec, err := avro.NewAvroDecoder(f)
	if err != nil {
		t.Fatal(err)
	}
	var out []models.RevGeoResult
	for dec.MoveNext() {
		var r models.RevGeoResult
		if err := dec.DecodeItem(&r); err != nil {
			t.Fatal(err)
		}
		out = append(out, r)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Id < out[j].Id })
	return out
}

func TestRunWindowProcessesRecordsAndRechecks(t *testing.T) {
	e := setup(t)
	ctx := context.Background()

	dec, err := e.runner.Check(ctx, day)
	if err != nil || !dec.Process {
		t.Fatalf("expected process for a new date: %+v %v", dec, err)
	}
	if failed := e.runner.RunWindow(ctx, day, day); len(failed) != 0 {
		t.Fatalf("failed: %v", failed)
	}
	for _, p := range []string{"fetch/2026-07-31.avro", "ipgeocode/2026-07-31.avro", "reversegeocode/2026-07-31.avro", "completeness/2026-07-31.json"} {
		if !e.exists(p) {
			t.Fatalf("%s not stored", p)
		}
	}
	// upload order: fetch, reversegeocode, ipgeocode, manifest
	want := []string{"fetch/2026-07-31.avro", "reversegeocode/2026-07-31.avro", "ipgeocode/2026-07-31.avro", "completeness/2026-07-31.json"}
	if fmt.Sprint(e.storage.stored) != fmt.Sprint(want) {
		t.Fatalf("upload order %v", e.storage.stored)
	}
	m, err := e.runner.LoadManifest(ctx, day)
	if err != nil || m == nil {
		t.Fatal(m, err)
	}
	if m.Fetch.TotalListed() != 2 || m.Fetch.TotalProcessed() != 2 || m.Fetch.Tests != 10 ||
		m.IPGeocode.Read != 10 || m.IPGeocode.Written != 10 || m.IPGeocode.Located != 8 || m.IPGeocode.WithASN != 6 ||
		m.ReverseGeocode.Read != 10 || m.ReverseGeocode.Matched != 6 || m.ReverseGeocode.Written != 6 {
		b, _ := json.Marshal(m)
		t.Fatalf("manifest %s", b)
	}
	rows := readRevGeo(t, filepath.Join(e.dir, "storage", "reversegeocode/2026-07-31.avro"))
	for _, r := range rows {
		if r.GeoNamespace != "US_STATES" || r.GeoId != "06" {
			t.Fatalf("row %+v", r)
		}
	}
	// local temporary files are cleared
	if entries, _ := filepath.Glob(filepath.Join(e.dir, "output", "*", "*")); len(entries) != 0 {
		t.Fatalf("leftover local files %v", entries)
	}

	if dec, err := e.runner.Check(ctx, day); err != nil || dec.Process {
		t.Fatalf("expected complete: %+v %v", dec, err)
	}
	// M-Lab publishes a late tarball: the re-check must reprocess the date
	e.src.objects[prefix+"c.tgz"] = tarball(t, "c", "10.0.0.1")
	dec, err = e.runner.Check(ctx, day)
	if err != nil || !dec.Process || !strings.Contains(dec.Reason, "3 tarballs, 2 were processed") {
		t.Fatalf("expected reprocess: %+v %v", dec, err)
	}
	if failed := e.runner.RunWindow(ctx, day, day); len(failed) != 0 {
		t.Fatalf("failed: %v", failed)
	}
	m, _ = e.runner.LoadManifest(ctx, day)
	if m.Fetch.TotalProcessed() != 3 || m.Fetch.Tests != 12 || m.ReverseGeocode.Written != 8 {
		b, _ := json.Marshal(m)
		t.Fatalf("manifest after refetch %s", b)
	}
}

func TestFailedFetchUploadsNothing(t *testing.T) {
	e := setup(t)
	e.src.failOpen[prefix+"b.tgz"] = true
	failed := e.runner.RunWindow(context.Background(), day, day)
	if len(failed) != 1 {
		t.Fatalf("expected the date to fail, got %v", failed)
	}
	if len(e.storage.stored) != 0 {
		t.Fatalf("uploaded %v", e.storage.stored)
	}
	if dec, _ := e.runner.Check(context.Background(), day); !dec.Process {
		t.Fatal("a failed date must stay pending")
	}
}

func TestExistsErrorIsNotNotFound(t *testing.T) {
	e := setup(t)
	ctx := context.Background()
	if err := e.runner.RunDate(ctx, day, pipeline.AllSteps, false); err != nil {
		t.Fatal(err)
	}
	e.storage.stored = nil
	e.storage.failExists = true
	if err := e.runner.RunDate(ctx, day, pipeline.AllSteps, false); err == nil {
		t.Fatal("expected an error when HEAD fails")
	}
	if len(e.storage.stored) != 0 {
		t.Fatalf("a failing HEAD caused uploads: %v", e.storage.stored)
	}
	if _, err := e.runner.Check(ctx, day); err == nil {
		t.Fatal("expected Check to fail when HEAD fails")
	}
}

func TestSkipExistingAndPartialRerun(t *testing.T) {
	e := setup(t)
	ctx := context.Background()
	if err := e.runner.RunDate(ctx, day, pipeline.AllSteps, false); err != nil {
		t.Fatal(err)
	}
	e.storage.stored = nil
	// everything exists: nothing runs, nothing uploaded
	if err := e.runner.RunDate(ctx, day, pipeline.AllSteps, false); err != nil {
		t.Fatal(err)
	}
	if len(e.storage.stored) != 0 {
		t.Fatalf("uploaded %v", e.storage.stored)
	}
	// downstream-only rerun reads fetch from the storage and updates the manifest
	if err := e.runner.RunDate(ctx, day, []string{"ipgeocode", "reversegeocode"}, true); err != nil {
		t.Fatal(err)
	}
	if m, _ := e.runner.LoadManifest(ctx, day); m == nil || m.IPGeocode.Read != 10 {
		t.Fatalf("manifest %+v", m)
	}
	// fetch-only rerun makes the downstream outputs stale: the manifest is removed
	if err := e.runner.RunDate(ctx, day, []string{"fetch"}, true); err != nil {
		t.Fatal(err)
	}
	if e.exists("completeness/2026-07-31.json") {
		t.Fatal("stale manifest kept after a fetch-only rerun")
	}
	// a leftover local file from an interrupted run is not taken as done
	os.MkdirAll(filepath.Join(e.dir, "output", "ipgeocode"), 0755)
	writeFile(t, filepath.Join(e.dir, "output", "ipgeocode", "2026-07-30.avro"), "partial")
	exists := false
	ds, _ := e.runner.Provider("ipgeocode", day.AddDate(0, 0, -1), models.GeocodedResult{})
	if exists, _ = ds.Exists(); exists {
		t.Fatal("local leftover counted as done")
	}
}

func TestIPGeocodeWithoutFetchFails(t *testing.T) {
	e := setup(t)
	if err := e.runner.RunDate(context.Background(), day, []string{"ipgeocode"}, false); err == nil {
		t.Fatal("expected an error when the fetch output is missing")
	}
}
