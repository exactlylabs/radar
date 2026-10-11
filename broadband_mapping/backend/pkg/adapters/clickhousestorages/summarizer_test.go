package clickhousestorages

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/google/uuid"
)

// Compares the summarizer with the original materialized view definitions (testdata/legacy_views)
// on synthetic data. Needs a ClickHouse server: CLICKHOUSE_TEST_ADDR=localhost:9000.

func testConn(t *testing.T) driver.Conn {
	addr := os.Getenv("CLICKHOUSE_TEST_ADDR")
	if addr == "" {
		t.Skip("CLICKHOUSE_TEST_ADDR not set")
	}
	admin, err := clickhouse.Open(&clickhouse.Options{Addr: []string{addr}})
	if err != nil {
		t.Fatal(err)
	}
	db := fmt.Sprintf("summarizer_test_%d", time.Now().UnixNano())
	if err := admin.Exec(context.Background(), "CREATE DATABASE "+db); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		admin.Exec(context.Background(), "DROP DATABASE "+db)
		admin.Close()
	})
	conn, err := clickhouse.Open(&clickhouse.Options{Addr: []string{addr}, Auth: clickhouse.Auth{Database: db}})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { conn.Close() })
	for _, f := range []string{"002_asn_orgs.sql", "003_measurements.sql"} {
		sql, err := os.ReadFile(filepath.Join("..", "..", "..", "migrations", f))
		if err != nil {
			t.Fatal(err)
		}
		mustExec(t, conn, string(sql))
	}
	return conn
}

func mustExec(t *testing.T, conn driver.Conn, query string, args ...any) {
	t.Helper()
	if err := conn.Exec(context.Background(), query, args...); err != nil {
		t.Fatalf("%v\n%s", err, query)
	}
}

type fixture struct {
	geospaces []string
	asns      []string
	ips       []string
	rnd       *rand.Rand
}

func newFixture(t *testing.T, conn driver.Conn) *fixture {
	f := &fixture{rnd: rand.New(rand.NewSource(1))}
	for i := 0; i < 5; i++ {
		f.geospaces = append(f.geospaces, uuid.NewString())
	}
	for i := 0; i < 4; i++ {
		id := uuid.NewString()
		f.asns = append(f.asns, id)
		name := fmt.Sprintf("ISP %d", i)
		if i == 3 {
			name = "" // us_asns skips unnamed orgs
		}
		mustExec(t, conn, "INSERT INTO asn_orgs (id, name) VALUES (?, ?)", id, name)
	}
	for i := 0; i < 60; i++ {
		f.ips = append(f.ips, fmt.Sprintf("10.0.%d.%d", i/250, i%250))
	}
	return f
}

// insert adds n measurements spread over [from, to). Speeds repeat often so medians hit
// ties, and most IPs test several times per bucket so per-IP medians of even counts matter.
func (f *fixture) insert(t *testing.T, conn driver.Conn, from, to time.Time, n int) {
	batch, err := conn.PrepareBatch(context.Background(), `INSERT INTO measurements (
		id, test_style, ip, time, upload, mbps, loss_rate, min_rtt, latitude, longitude,
		location_accuracy_km, has_access_token, access_token_sig, asn_org_id, geospace_id)`)
	if err != nil {
		t.Fatal(err)
	}
	span := to.Sub(from)
	for i := 0; i < n; i++ {
		ts := from.Add(time.Duration(f.rnd.Int63n(int64(span)))).UTC().Truncate(time.Second)
		mbps := float64(f.rnd.Intn(30)) * 5
		rtt := float64(f.rnd.Intn(20)) * 3
		if err := batch.Append(
			uuid.NewString(), "ndt7", f.ips[f.rnd.Intn(len(f.ips))], ts, f.rnd.Intn(2) == 1, mbps,
			0.0, rtt, 0.0, 0.0, 0.0, false, "",
			uuid.MustParse(f.asns[f.rnd.Intn(len(f.asns))]), uuid.MustParse(f.geospaces[f.rnd.Intn(len(f.geospaces))]),
		); err != nil {
			t.Fatal(err)
		}
	}
	if err := batch.Send(); err != nil {
		t.Fatal(err)
	}
}

// legacySelect is the SELECT of an original materialized view definition.
func legacySelect(t *testing.T, table string) string {
	sql, err := os.ReadFile(filepath.Join("testdata", "legacy_views", table+".sql"))
	if err != nil {
		t.Fatal(err)
	}
	s := string(sql)
	i := strings.Index(s, "POPULATE")
	if i < 0 {
		t.Fatalf("%s: no POPULATE", table)
	}
	s = strings.TrimSpace(s[i+len("POPULATE"):])
	s = strings.TrimPrefix(s, "AS")
	return strings.TrimSuffix(strings.TrimSpace(s), ";")
}

// rows returns the rows of a query as sorted "column=value" strings, independent of column order.
func rows(t *testing.T, conn driver.Conn, query string) []string {
	t.Helper()
	desc, err := conn.Query(context.Background(), fmt.Sprintf("DESCRIBE (%s)", query))
	if err != nil {
		t.Fatalf("%v\n%s", err, query)
	}
	parts := []string{}
	for desc.Next() {
		var name, typ, defType, defExpr, comment, codec, ttl string
		if err := desc.Scan(&name, &typ, &defType, &defExpr, &comment, &codec, &ttl); err != nil {
			t.Fatal(err)
		}
		parts = append(parts, fmt.Sprintf("concat('%[1]s=', toString(`%[1]s`))", name))
	}
	desc.Close()
	r, err := conn.Query(context.Background(), fmt.Sprintf("SELECT arrayStringConcat(arraySort([%s]), ' ') FROM (%s)", strings.Join(parts, ", "), query))
	if err != nil {
		t.Fatalf("%v\n%s", err, query)
	}
	defer r.Close()
	result := []string{}
	for r.Next() {
		var row string
		if err := r.Scan(&row); err != nil {
			t.Fatal(err)
		}
		result = append(result, row)
	}
	sort.Strings(result)
	return result
}

func assertSameRows(t *testing.T, conn driver.Conn, table, want, got string) {
	t.Helper()
	w, g := rows(t, conn, want), rows(t, conn, got)
	if len(w) == 0 {
		t.Fatalf("%s: legacy query returned no rows, the fixture doesn't cover it", table)
	}
	if strings.Join(w, "\n") != strings.Join(g, "\n") {
		t.Fatalf("%s differs: legacy has %d rows, new has %d\nfirst legacy: %s\nfirst new:    %s", table, len(w), len(g), w[0], first(g))
	}
}

func first(s []string) string {
	if len(s) == 0 {
		return "<none>"
	}
	return s[0]
}

// assertMatchesLegacy checks every summary table (with suffix) against the legacy view queries.
func assertMatchesLegacy(t *testing.T, conn driver.Conn, suffix string) {
	t.Helper()
	for _, table := range SummaryTables() {
		if table == usASNsTable {
			continue
		}
		assertSameRows(t, conn, table, legacySelect(t, table), "SELECT * FROM `"+table+suffix+"`")
	}
	// us_asns is derived from summary_alltime, which is checked above.
	legacyASNs := strings.ReplaceAll(legacySelect(t, usASNsTable), "FROM summary_alltime s", "FROM `summary_alltime"+suffix+"` s")
	assertSameRows(t, conn, usASNsTable, legacyASNs, "SELECT * FROM `"+usASNsTable+suffix+"`")
}

func TestSummarizerMatchesLegacyViews(t *testing.T) {
	conn := testConn(t)
	f := newFixture(t, conn)
	day := func(s string) time.Time { tm, _ := time.Parse(time.DateOnly, s); return tm }
	// Crosses year ends (week 0 and 52/53), December (semester 3) and quarter boundaries.
	f.insert(t, conn, day("2024-11-20"), day("2026-01-12"), 20000)

	// Tiny shards so most buckets span several shards.
	opts := DefaultSummarizerOptions
	opts.ShardTargetRows = 300
	s := NewSummarizer(conn, opts)

	// Production state before the switch: unpartitioned tables built by the old views, and a
	// leftover materialized view still attached to measurements.
	for _, table := range SummaryTables() {
		mustExec(t, conn, fmt.Sprintf("CREATE TABLE `%s` ENGINE = MergeTree ORDER BY tuple() AS %s", table, legacySelect(t, table)))
	}
	mustExec(t, conn, "CREATE MATERIALIZED VIEW summary_alltime_tmp ENGINE = MergeTree ORDER BY tuple() AS SELECT count() c FROM measurements")

	if err := s.Update(day("2026-01-01"), day("2026-01-12")); err == nil {
		t.Fatal("Update must refuse unpartitioned tables")
	}

	if err := s.RebuildAll(); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "_next")

	if err := s.SwitchOver(); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "")
	for _, gone := range []string{"summary_alltime_tmp", "summary_week_next"} {
		if ok, err := s.tableExists(gone); err != nil || ok {
			t.Fatalf("%s should be gone (exists=%v, err=%v)", gone, ok, err)
		}
	}
	if ok, _ := s.tableExists("summary_week_old"); !ok {
		t.Fatal("the replaced table should be kept as summary_week_old")
	}

	// A later ingest: new days in the last, partly summarized bucket and in new buckets.
	f.insert(t, conn, day("2026-01-10"), day("2026-03-05"), 4000)
	if err := s.Update(day("2026-01-10"), day("2026-03-04")); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "")
}

func TestBucketsCoverWholePeriods(t *testing.T) {
	conn := testConn(t)
	s := NewSummarizer(conn, DefaultSummarizerOptions)
	day := func(s string) time.Time { tm, _ := time.Parse(time.DateOnly, s); return tm }
	for _, tc := range []struct {
		window   string
		from, to string
		want     []string // partition first..last
	}{
		{"month", "2026-02-15", "2026-03-02", []string{"(2026, 2) 2026-02-01..2026-02-28", "(2026, 3) 2026-03-01..2026-03-31"}},
		{"year", "2025-12-31", "2026-01-01", []string{"2025 2025-01-01..2025-12-31", "2026 2026-01-01..2026-12-31"}},
		{"semester", "2026-12-01", "2026-12-01", []string{"(2026, 3) 2026-12-01..2026-12-31"}},
		// WEEK() mode 0: weeks start on Sunday and days before the first Sunday are week 0.
		{"week", "2026-01-01", "2026-01-05", []string{"(2026, 0) 2026-01-01..2026-01-03", "(2026, 1) 2026-01-04..2026-01-10"}},
	} {
		var w summaryWindow
		for _, sw := range summaryWindows {
			if sw.name == tc.window {
				w = sw
			}
		}
		buckets, err := s.buckets(w, day(tc.from), day(tc.to))
		if err != nil {
			t.Fatal(err)
		}
		got := []string{}
		for _, b := range buckets {
			got = append(got, fmt.Sprintf("%s %s..%s", b.partition(), b.firstDay, b.lastDay))
		}
		if strings.Join(got, "|") != strings.Join(tc.want, "|") {
			t.Errorf("%s %s..%s: got %v, want %v", tc.window, tc.from, tc.to, got, tc.want)
		}
	}
}
