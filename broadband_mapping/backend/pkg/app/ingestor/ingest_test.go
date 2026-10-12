package ingestor

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ingestor/models"
	"github.com/google/uuid"
	"github.com/hamba/avro/ocf"
)

// memStorage is an in-memory bucket.
type memStorage struct{ files map[string][]byte }

func (m *memStorage) Read(ctx context.Context, path string) (io.ReadCloser, error) {
	b, ok := m.files[path]
	if !ok {
		return nil, fmt.Errorf("%s not found", path)
	}
	return io.NopCloser(bytes.NewReader(b)), nil
}

func (m *memStorage) List(ctx context.Context, prefix string) ([]string, error) {
	names := []string{}
	for name := range m.files {
		if strings.HasPrefix(name, prefix) {
			names = append(names, name)
		}
	}
	sort.Strings(names)
	return names, nil
}

func (m *memStorage) Close() error { return nil }

const ipgeocodeSchema = `{"type": "record", "name": "IPGeocodeResult", "fields": [
	{"name": "id", "type": "string"}, {"name": "test_style", "type": "string"}, {"name": "ip", "type": "string"},
	{"name": "started_at", "type": "long"}, {"name": "upload", "type": "boolean"}, {"name": "mbps", "type": "float"},
	{"name": "loss_rate", "type": ["null", "float"]}, {"name": "min_rtt", "type": ["null", "float"]},
	{"name": "latitude", "type": "double"}, {"name": "longitude", "type": "double"}, {"name": "location_accuracy_km", "type": "double"},
	{"name": "asn", "type": "int"}, {"name": "asn_org", "type": "string"}, {"name": "asn_org_id", "type": ["null", "string"]},
	{"name": "has_access_token", "type": "boolean"}, {"name": "access_token_sig", "type": ["null", "string"]}]}`

const revgeoSchema = `{"type": "record", "name": "RevGeoResult", "fields": [
	{"name": "geo_namespace", "type": "string"}, {"name": "id", "type": "string"},
	{"name": "geo_id", "type": "string"}, {"name": "started_at", "type": "long"}]}`

func encode[T any](t *testing.T, schema string, values []T) []byte {
	var buf bytes.Buffer
	enc, err := ocf.NewEncoder(schema, &buf)
	if err != nil {
		t.Fatal(err)
	}
	for _, v := range values {
		if err := enc.Encode(v); err != nil {
			t.Fatal(err)
		}
	}
	if err := enc.Close(); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

type fileTest struct {
	id   string
	at   string // HH:MM:SS
	geos [][2]string
	mbps float32
}

// putDay writes a day's ipgeocode and reversegeocode files.
func putDay(t *testing.T, m *memStorage, day string, tests []fileTest) {
	ips := []models.IPGeocodeResult{}
	revs := []models.RevGeoResult{}
	rtt := float32(12)
	for _, ft := range tests {
		at, err := time.Parse("2006-01-02 15:04:05", day+" "+ft.at)
		if err != nil {
			t.Fatal(err)
		}
		ips = append(ips, models.IPGeocodeResult{
			Id: ft.id, TestStyle: "ndt7", IP: "10.1.2.3", StartedAt: at.Unix(), MBPS: ft.mbps,
			MinRTT: &rtt, ASN: 7922, ASNOrg: "Comcast",
		})
		for _, g := range ft.geos {
			revs = append(revs, models.RevGeoResult{GeoNamespace: g[0], Id: ft.id, GeoId: g[1], StartedAt: at.Unix()})
		}
	}
	m.files["ipgeocode/"+day+".avro"] = encode(t, ipgeocodeSchema, ips)
	m.files["reversegeocode/"+day+".avro"] = encode(t, revgeoSchema, revs)
}

func TestFetchWaitsForManifests(t *testing.T) {
	m := &memStorage{files: map[string][]byte{}}
	for _, d := range []string{"2026-07-30", "2026-08-01", "2026-08-02", "2026-08-03"} {
		m.files["ipgeocode/"+d+".avro"] = nil
		m.files["reversegeocode/"+d+".avro"] = nil
	}
	m.files["completeness/2026-08-01.json"] = nil
	m.files["completeness/2026-08-03.json"] = nil
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	dates := func(opts FetchOptions) string {
		it, err := Fetch(m, fileDirectories, day("2026-07-30"), day("2026-08-04"), opts)
		if err != nil {
			t.Fatal(err)
		}
		if it == nil {
			return ""
		}
		got := []string{}
		for _, n := range it.names {
			got = append(got, strings.TrimSuffix(strings.TrimPrefix(n[0], "ipgeocode/"), ".avro"))
		}
		return strings.Join(got, " ")
	}
	// 2026-07-31 has no files; dates from 2026-08-01 need a manifest.
	opts := FetchOptions{ManifestDir: "completeness", ManifestFrom: day("2026-08-01")}
	if got := dates(opts); got != "2026-07-30 2026-08-01 2026-08-03" {
		t.Errorf("skipping: got %q", got)
	}
	opts.StopAtMissing = true
	if got := dates(opts); got != "2026-07-30" {
		t.Errorf("stopping at the first missing date: got %q", got)
	}
	if got := dates(FetchOptions{}); got != "2026-07-30 2026-08-01 2026-08-02 2026-08-03" {
		t.Errorf("without manifests: got %q", got)
	}
}

func testConn(t *testing.T) driver.Conn {
	addr := os.Getenv("CLICKHOUSE_TEST_ADDR")
	if addr == "" {
		t.Skip("CLICKHOUSE_TEST_ADDR not set")
	}
	admin, err := clickhouse.Open(&clickhouse.Options{Addr: []string{addr}})
	if err != nil {
		t.Fatal(err)
	}
	db := fmt.Sprintf("ingestor_test_%d", time.Now().UnixNano())
	if err := admin.Exec(context.Background(), "CREATE DATABASE "+db); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		admin.Exec(context.Background(), "DROP DATABASE "+db)
		admin.Close()
	})
	conn, err := clickhouse.Open(&clickhouse.Options{Addr: []string{addr}, Auth: clickhouse.Auth{Database: db}, MaxOpenConns: 20})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { conn.Close() })
	for _, f := range []string{"001_geospaces.sql", "002_asn_orgs.sql", "004_tests.sql"} {
		sql, err := os.ReadFile(filepath.Join("..", "..", "..", "migrations", f))
		if err != nil {
			t.Fatal(err)
		}
		if err := conn.Exec(context.Background(), string(sql)); err != nil {
			t.Fatal(err)
		}
	}
	return conn
}

func TestIngestAndRepair(t *testing.T) {
	conn := testConn(t)
	ctx := context.Background()
	geo := map[string]string{} // "namespace/geo_id" -> id
	for _, g := range [][2]string{{"states", "51"}, {"counties", "51161"}, {"counties", "51775"}, {"tribal_tracts", "T1"}, {"tribal_tracts", "A1"}} {
		id := uuid.NewString()
		geo[g[0]+"/"+g[1]] = id
		if err := conn.Exec(ctx, "INSERT INTO geospaces (id, namespace, geo_id, centroid_lat, centroid_long) VALUES (?, ?, ?, 0, 0)", id, g[0], g[1]); err != nil {
			t.Fatal(err)
		}
	}
	m := &memStorage{files: map[string][]byte{}}
	va := [2]string{"US_STATES", "51"}
	roanoke, salem := [2]string{"US_COUNTIES", "51161"}, [2]string{"US_COUNTIES", "51775"}
	putDay(t, m, "2026-08-01", []fileTest{
		{id: "a", at: "01:00:00", geos: [][2]string{va, roanoke}, mbps: 10},
		{id: "b", at: "02:00:00", geos: [][2]string{va, roanoke, salem, roanoke}, mbps: 20},                     // two counties, one listed twice
		{id: "c", at: "03:00:00", geos: [][2]string{{"US_TRIBAL_TRACTS", "T1"}, {"US_AIANNH", "A1"}}, mbps: 30}, // tribal tract and AIANNH area, no state
		{id: "d", at: "04:00:00", geos: [][2]string{{"ZIP_CODES", "24153"}}, mbps: 40},                          // no US state/county/tribal: dropped
		{id: "e", at: "05:00:00", mbps: 50},                                                                     // not reverse geocoded: dropped
		{id: "f", at: "06:00:00", geos: [][2]string{va, {"US_COUNTIES", "99999"}}, mbps: 60},                    // unknown county: state only
	})
	putDay(t, m, "2026-08-02", []fileTest{{id: "g", at: "01:00:00", geos: [][2]string{va, salem}, mbps: 70}})

	s := clickhousestorages.NewIngestorAppStorages(conn, 2)
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	if err := Ingest(ctx, s, m, day("2026-08-01"), day("2026-08-03"), nil, false, FetchOptions{}); err != nil {
		t.Fatal(err)
	}
	got := func() string {
		rows, err := conn.Query(ctx, `SELECT id, toString(state_id), toString(county_id), toString(tribal_id), arrayStringConcat(arrayMap(x -> toString(x), extra_geospace_ids), ',') FROM tests ORDER BY id`)
		if err != nil {
			t.Fatal(err)
		}
		defer rows.Close()
		out := []string{}
		for rows.Next() {
			var id string
			var st, co, tr *string
			var ex string
			if err := rows.Scan(&id, &st, &co, &tr, &ex); err != nil {
				t.Fatal(err)
			}
			name := func(p *string) string {
				if p == nil {
					return "-"
				}
				for k, v := range geo {
					if v == *p {
						return k
					}
				}
				return *p
			}
			extras := []string{}
			for _, e := range strings.Split(ex, ",") {
				if e != "" {
					extras = append(extras, name(&e))
				}
			}
			out = append(out, fmt.Sprintf("%s %s %s %s [%s]", id, name(st), name(co), name(tr), strings.Join(extras, " ")))
		}
		return strings.Join(out, "\n")
	}
	minID := func(a, b string) (string, string) {
		if geo[a] < geo[b] {
			return a, b
		}
		return b, a
	}
	c1, c2 := minID("counties/51161", "counties/51775")
	t1, t2 := minID("tribal_tracts/T1", "tribal_tracts/A1")
	want := strings.Join([]string{
		"a states/51 counties/51161 - []",
		fmt.Sprintf("b states/51 %s - [%s]", c1, c2),
		fmt.Sprintf("c - - %s [%s]", t1, t2),
		"f states/51 - - []",
		"g states/51 counties/51775 - []",
	}, "\n")
	if g := got(); g != want {
		t.Fatalf("tests:\n%s\nwant:\n%s", g, want)
	}

	// The cursor is the newest test time, from the parts' metadata.
	last, err := s.MeasurementStorage.LastDate()
	if err != nil || last == nil || !last.Equal(time.Date(2026, 8, 2, 1, 0, 0, 0, time.UTC)) {
		t.Fatalf("LastDate = %v, %v", last, err)
	}
	// The hourly run finds the last day's files again and inserts nothing (summaries would fail:
	// they don't exist yet, so this also checks it doesn't summarize).
	before := s.MeasurementStorage.Inserted()
	if err := Ingest(ctx, s, m, *last, day("2026-08-03"), last, true, FetchOptions{}); err != nil {
		t.Fatal(err)
	}
	if s.MeasurementStorage.Inserted() != before {
		t.Fatal("re-reading the last day must not insert anything")
	}

	summarizer := clickhousestorages.NewSummarizer(conn, clickhousestorages.DefaultSummarizerOptions)
	if err := summarizer.RebuildAll(); err != nil {
		t.Fatal(err)
	}
	if err := summarizer.SwitchOver(); err != nil {
		t.Fatal(err)
	}
	samples := func() uint64 {
		var n uint64
		if err := conn.QueryRow(ctx, "SELECT sum(total_samples) FROM summary_geospace_month WHERE upload = false AND geospace_id = ?", geo["states/51"]).Scan(&n); err != nil {
			t.Fatal(err)
		}
		return n
	}
	if n := samples(); n != 1 {
		t.Fatalf("Virginia should have 1 IP in 2026-08, has %d", n)
	}

	// The processor re-uploaded 2026-08-01 with a test that was missing.
	putDay(t, m, "2026-08-01", []fileTest{
		{id: "a", at: "01:00:00", geos: [][2]string{va, roanoke}, mbps: 10},
		{id: "h", at: "07:00:00", geos: [][2]string{va, roanoke}, mbps: 80},
	})
	if err := Repair(ctx, s, m, []time.Time{day("2026-08-01")}, false, true); err != nil {
		t.Fatalf("%+v", err)
	}
	if g := got(); !strings.Contains(g, "h states/51 counties/51161") || !strings.Contains(g, "\nb ") {
		t.Fatalf("adding missing tests must keep the others and add h:\n%s", g)
	}

	// A web100-era day processed again: new random ids, so the day is replaced.
	putDay(t, m, "2026-08-01", []fileTest{
		{id: "x1", at: "01:00:00", geos: [][2]string{va, roanoke}, mbps: 10},
		{id: "x2", at: "02:00:00", geos: [][2]string{va, salem}, mbps: 20},
	})
	if err := Repair(ctx, s, m, []time.Time{day("2026-08-01")}, true, true); err != nil {
		t.Fatal(err)
	}
	want = strings.Join([]string{
		"g states/51 counties/51775 - []",
		"x1 states/51 counties/51161 - []",
		"x2 states/51 counties/51775 - []",
	}, "\n")
	if g := got(); g != want {
		t.Fatalf("after replacing 2026-08-01:\n%s\nwant:\n%s", g, want)
	}
	// Every test is from the same IP, so the month still has one IP per geospace; the
	// summaries were updated from the replaced tests.
	var med float64
	if err := conn.QueryRow(ctx, "SELECT med_mbps FROM summary_geospace_month WHERE upload = false AND geospace_id = ?", geo["states/51"]).Scan(&med); err != nil {
		t.Fatal(err)
	}
	if med != 20 { // median of 10, 20, 70
		t.Fatalf("Virginia's median should be 20 after the repair, is %v", med)
	}
	if n := samples(); n != 1 {
		t.Fatalf("Virginia should have 1 IP in 2026-08, has %d", n)
	}

	// Repairing a day without files fails before touching anything.
	if err := Repair(ctx, s, m, []time.Time{day("2026-08-05")}, true, false); err == nil {
		t.Fatal("repairing a day without files must fail")
	}
}
