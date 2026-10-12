package ingestor

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"runtime/pprof"
	"sort"
	"strings"
	"syscall"
	"testing"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor/models"
	"github.com/google/uuid"
	"github.com/hamba/avro/v2/ocf"
)

// dirStorage reads a processor output tree (ipgeocode/<date>.avro, ...) from a directory.
type dirStorage struct{ dir string }

func (d *dirStorage) Read(ctx context.Context, path string) (io.ReadCloser, error) {
	return os.Open(filepath.Join(d.dir, path))
}

func (d *dirStorage) List(ctx context.Context, prefix string) ([]string, error) {
	matches, err := filepath.Glob(d.dir + "/" + prefix + "*")
	if err != nil {
		return nil, err
	}
	var out []string
	for _, m := range matches {
		rel, _ := filepath.Rel(d.dir, m)
		out = append(out, rel)
	}
	sort.Strings(out)
	return out, nil
}

func (d *dirStorage) Close() error { return nil }

// TestIngestBench ingests a real-sized day from INGEST_BENCH_DIR (a directory with
// ipgeocode/<date>.avro and reversegeocode/<date>.avro, e.g. the output of
// mlab-processor's stepbench) into a fresh test database and reports wall time, CPU,
// peak RSS and a checksum of the rows (geospace and ASN ids are derived from their names,
// so the checksum compares across runs and implementations). It needs
// CLICKHOUSE_TEST_ADDR. INGEST_BENCH_CPUPROFILE writes a CPU profile.
func TestIngestBench(t *testing.T) {
	dir := os.Getenv("INGEST_BENCH_DIR")
	if dir == "" {
		t.Skip("INGEST_BENCH_DIR not set")
	}
	conn := testConn(t)
	ctx := context.Background()
	storage := &dirStorage{dir}
	files, err := storage.List(ctx, "reversegeocode/")
	if err != nil || len(files) == 0 {
		t.Fatalf("no reversegeocode files: %v", err)
	}
	date, _ := time.Parse("2006-01-02", strings.TrimSuffix(filepath.Base(files[0]), ".avro"))

	// Every geospace of the reversegeocode file exists.
	f, err := storage.Read(ctx, files[0])
	if err != nil {
		t.Fatal(err)
	}
	dec, err := ocf.NewDecoder(f)
	if err != nil {
		t.Fatal(err)
	}
	seen := map[[2]string]bool{}
	for dec.HasNext() {
		var r models.RevGeoResult
		if err := dec.Decode(&r); err != nil {
			t.Fatal(err)
		}
		ns, ok := geoNamespaceMap[r.GeoNamespace]
		if !ok {
			continue
		}
		seen[[2]string{string(ns), r.GeoId}] = true
	}
	f.Close()
	batch, err := conn.PrepareBatch(ctx, "INSERT INTO geospaces (id, namespace, geo_id, centroid_lat, centroid_long)")
	if err != nil {
		t.Fatal(err)
	}
	for k := range seen {
		if err := batch.Append(uuid.NewSHA1(uuid.NameSpaceOID, []byte(k[0]+"/"+k[1])), k[0], k[1], 0.0, 0.0); err != nil {
			t.Fatal(err)
		}
	}
	if err := batch.Send(); err != nil {
		t.Fatal(err)
	}
	t.Logf("%d geospaces", len(seen))
	// Every ASN org of the ipgeocode file exists too (as in production, where orgs are
	// created once; creating them one by one takes 0.2 s each).
	f, err = storage.Read(ctx, "ipgeocode/"+date.Format("2006-01-02")+".avro")
	if err != nil {
		t.Fatal(err)
	}
	dec, err = ocf.NewDecoder(f)
	if err != nil {
		t.Fatal(err)
	}
	orgs := map[string]bool{}
	for dec.HasNext() {
		var r models.IPGeocodeResult
		if err := dec.Decode(&r); err != nil {
			t.Fatal(err)
		}
		orgs[r.ASNOrg] = true
	}
	f.Close()
	batch, err = conn.PrepareBatch(ctx, "INSERT INTO asn_orgs (id, name)")
	if err != nil {
		t.Fatal(err)
	}
	for name := range orgs {
		if err := batch.Append(uuid.NewSHA1(uuid.NameSpaceOID, []byte("asn/"+name)), name); err != nil {
			t.Fatal(err)
		}
	}
	if err := batch.Send(); err != nil {
		t.Fatal(err)
	}
	t.Logf("%d asn orgs", len(orgs))

	workers := runtime.NumCPU()
	if w := os.Getenv("INGEST_BENCH_WORKERS"); w != "" {
		fmt.Sscan(w, &workers)
	}
	s := clickhousestorages.NewIngestorAppStorages(conn, workers)
	if p := os.Getenv("INGEST_BENCH_CPUPROFILE"); p != "" {
		pf, err := os.Create(p)
		if err != nil {
			t.Fatal(err)
		}
		pprof.StartCPUProfile(pf)
		defer func() { pprof.StopCPUProfile(); pf.Close() }()
	}
	var ru0, ru1 syscall.Rusage
	var ms0, ms1 runtime.MemStats
	syscall.Getrusage(syscall.RUSAGE_SELF, &ru0)
	runtime.ReadMemStats(&ms0)
	start := time.Now()
	if err := Ingest(ctx, s, storage, date, date.AddDate(0, 0, 1), nil, false, FetchOptions{}); err != nil {
		t.Fatalf("%+v", err)
	}
	wall := time.Since(start)
	syscall.Getrusage(syscall.RUSAGE_SELF, &ru1)
	runtime.ReadMemStats(&ms1)
	tv := func(t syscall.Timeval) float64 { return float64(t.Sec) + float64(t.Usec)/1e6 }
	cpu := tv(ru1.Utime) + tv(ru1.Stime) - tv(ru0.Utime) - tv(ru0.Stime)

	var n uint64
	var sum string
	if err := conn.QueryRow(ctx, `SELECT count(), toString(sum(cityHash64(id, test_style, ip, upload, mbps, min_rtt, loss_rate, latitude, longitude,
		location_accuracy_km, has_access_token, access_token_sig, asn_org_id, state_id, county_id, tribal_id, extra_geospace_ids))) FROM tests`).Scan(&n, &sum); err != nil {
		t.Fatal(err)
	}
	t.Logf("INGEST workers=%d wall=%.2fs cpu=%.1fs maxrss=%dMB mallocs=%.1fM alloc=%.0fMB rows=%d checksum=%s",
		workers, wall.Seconds(), cpu, ru1.Maxrss/1024, float64(ms1.Mallocs-ms0.Mallocs)/1e6, float64(ms1.TotalAlloc-ms0.TotalAlloc)/1e6, n, sum)
}
