package clickhousestorages

import (
	"context"
	"fmt"
	"math/rand"
	"net"
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
// on synthetic data. The legacy semester definitions carry one deliberate change: semester is
// (MONTH - 1) / 6 + 1, the halves the map asks for, instead of the original MONTH / 6 + 1. Needs a ClickHouse server: CLICKHOUSE_TEST_ADDR=localhost:9000.

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
	for _, f := range []string{"001_geospaces.sql", "002_asn_orgs.sql", "003_measurements.sql", "004_tests.sql"} {
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
	states, counties, tribal []uuid.UUID
	// parent is each county's state (geospaces.parent_id).
	parent map[uuid.UUID]uuid.UUID
	// unknown is a geospace missing from the geospaces table.
	unknown uuid.UUID
	asns    []string
	ips     []string
	// home is the county and ASN org most tests of an IP use, so most IPs have one
	// (state, county, ASN) per bucket, as in production, and the summarizer derives their
	// state and county rows from one aggregation; the other tests make an IP span several.
	home   map[string]ipHome
	rnd    *rand.Rand
	nextID int
}

type ipHome struct {
	county uuid.UUID
	asn    uuid.UUID
}

func newFixture(t *testing.T, conn driver.Conn) *fixture {
	f := &fixture{rnd: rand.New(rand.NewSource(1)), unknown: uuid.New(), parent: map[uuid.UUID]uuid.UUID{}}
	for _, ns := range []struct {
		name string
		n    int
	}{{"states", 2}, {"counties", 4}, {"tribal_tracts", 2}, {"ZIP_CODES", 1}} {
		for i := 0; i < ns.n; i++ {
			id := uuid.New()
			var parent any // NULL but for counties
			if ns.name == "counties" {
				p := f.states[i%len(f.states)]
				parent = p
				f.parent[id] = p
			}
			mustExec(t, conn, "INSERT INTO geospaces (id, namespace, geo_id, centroid_lat, centroid_long, parent_id) VALUES (?, ?, ?, 0, 0, ?)", id, ns.name, fmt.Sprint(i), parent)
			switch ns.name {
			case "states":
				f.states = append(f.states, id)
			case "counties":
				f.counties = append(f.counties, id)
			case "tribal_tracts":
				f.tribal = append(f.tribal, id)
			}
		}
	}
	sortUUIDs(f.states)
	sortUUIDs(f.counties)
	sortUUIDs(f.tribal)
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
	f.ips = append(f.ips, "2001:db8::1", "2001:db8::2")
	f.home = map[string]ipHome{}
	for _, ip := range f.ips {
		f.home[ip] = ipHome{f.counties[f.rnd.Intn(len(f.counties))], uuid.MustParse(f.asns[f.rnd.Intn(len(f.asns))])}
	}
	return f
}

func sortUUIDs(ids []uuid.UUID) {
	sort.Slice(ids, func(i, j int) bool { return ids[i].String() < ids[j].String() })
}

func (f *fixture) pick(ids []uuid.UUID, p float64) *uuid.UUID {
	if f.rnd.Float64() >= p {
		return nil
	}
	id := ids[f.rnd.Intn(len(ids))]
	return &id
}

// insert adds n tests spread over [from, to), each as one row of tests and as one row per
// geospace in measurements (the layout the legacy views read). Speeds repeat often so medians
// hit ties, and most IPs test several times per bucket so per-IP medians of even counts matter.
// Most tests of an IP are in its home county (and state) with its home ASN org; the others
// cover the edge cases of production: no state or no county, another county or state or ASN
// (an IP spanning several in one bucket), two counties (extra), two tribal areas, an extra
// geospace of an unknown namespace, no geospace at all, and a state that isn't the county's
// parent (1 test in 20 of those with both).
func (f *fixture) insert(t *testing.T, conn driver.Conn, from, to time.Time, n int) {
	tests, err := conn.PrepareBatch(context.Background(), `INSERT INTO tests (
		time, id, test_style, ip, upload, mbps, min_rtt, loss_rate, latitude, longitude,
		location_accuracy_km, has_access_token, access_token_sig, asn_org_id, state_id, county_id, tribal_id, extra_geospace_ids)`)
	if err != nil {
		t.Fatal(err)
	}
	measurements, err := conn.PrepareBatch(context.Background(), `INSERT INTO measurements (
		id, test_style, ip, time, upload, mbps, loss_rate, min_rtt, latitude, longitude,
		location_accuracy_km, has_access_token, access_token_sig, asn_org_id, geospace_id)`)
	if err != nil {
		t.Fatal(err)
	}
	span := to.Sub(from)
	for i := 0; i < n; i++ {
		f.nextID++
		id := fmt.Sprintf("ndt-test_%d_%016X", from.Unix(), f.nextID)
		ts := from.Add(time.Duration(f.rnd.Int63n(int64(span)))).UTC().Truncate(time.Second)
		mbps := float64(f.rnd.Intn(30)) * 5
		rtt := float64(f.rnd.Intn(20)) * 3
		ip := f.ips[f.rnd.Intn(len(f.ips))]
		upload := f.rnd.Intn(2) == 1
		asn := uuid.MustParse(f.asns[f.rnd.Intn(len(f.asns))])
		state, county, tribal := f.pick(f.states, 0.9), f.pick(f.counties, 0.9), f.pick(f.tribal, 0.15)
		if state != nil && county != nil && f.nextID%20 != 0 {
			p := f.parent[*county]
			state = &p
		}
		if f.rnd.Float64() < 0.8 {
			home := f.home[ip]
			c, p := home.county, f.parent[home.county]
			county, state, asn = &c, &p, home.asn
		}
		extra := []uuid.UUID{}
		if county != nil && f.rnd.Float64() < 0.05 {
			if other := f.pick(f.counties, 1); *other != *county {
				extra = append(extra, *other)
			}
		}
		if tribal != nil && f.rnd.Float64() < 0.1 {
			if other := f.pick(f.tribal, 1); *other != *tribal {
				extra = append(extra, *other)
			}
		}
		if f.rnd.Float64() < 0.01 {
			extra = append(extra, f.unknown)
		}
		if err := tests.Append(ts, id, "ndt7", net.ParseIP(ip), upload, mbps, rtt, 0.0, 0.0, 0.0, 0.0, false, "",
			asn, state, county, tribal, extra); err != nil {
			t.Fatal(err)
		}
		geos := append([]uuid.UUID{}, extra...)
		for _, g := range []*uuid.UUID{state, county, tribal} {
			if g != nil {
				geos = append(geos, *g)
			}
		}
		for _, g := range geos {
			if err := measurements.Append(id, "ndt7", ip, ts, upload, mbps, 0.0, rtt, 0.0, 0.0, 0.0, false, "", asn, g); err != nil {
				t.Fatal(err)
			}
		}
	}
	if err := tests.Send(); err != nil {
		t.Fatal(err)
	}
	if err := measurements.Send(); err != nil {
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
	t.Parallel()
	conn := testConn(t)
	f := newFixture(t, conn)
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	// Crosses year ends (week 0 and 52/53), December (semester 3) and quarter boundaries.
	f.insert(t, conn, day("2025-11-20"), day("2026-01-12"), 8000)

	// Tiny shards so most buckets span several shards.
	opts := DefaultSummarizerOptions
	opts.ShardTargetRows = 1500
	opts.Parallel = 8
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

	// The live tables were built by the legacy views from the same data: validation finds no
	// difference, until a live row is changed.
	assertValid := func(wantDiff bool) {
		t.Helper()
		results, err := s.Validate(day("2026-01-01"))
		if err != nil {
			t.Fatal(err)
		}
		diffs := 0
		for _, r := range results {
			if r.OnlyLive+r.OnlyNext > 0 {
				diffs++
			}
		}
		if len(results) != 8 || (diffs > 0) != wantDiff {
			t.Fatalf("validation: %d tables, %d differ: %+v", len(results), diffs, results)
		}
	}
	assertValid(false)
	mustExec(t, conn, "ALTER TABLE summary_month UPDATE med_mbps = med_mbps + 1 WHERE year = 2025 AND month = 12 SETTINGS mutations_sync = 1")
	assertValid(true)

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

	if ok, _ := s.tableExists("ip_medians_old"); ok {
		t.Fatal("ip_medians didn't exist before the first switch, there is nothing to keep")
	}

	// A later ingest: new days in the last, partly summarized bucket and in new buckets. The
	// fixture reuses the same IPs, so the all-time update recomputes IPs with history.
	f.insert(t, conn, day("2026-01-10"), day("2026-03-05"), 2000)
	if err := s.Update(day("2026-01-10"), day("2026-03-04")); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "")

	// A repaired day in the past: one more test of every IP, in a bucket already summarized.
	f.insert(t, conn, day("2025-12-03"), day("2025-12-04"), 300)
	if err := s.Update(day("2025-12-03"), day("2025-12-03")); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "")

	// Days without tests leave everything as it is (their buckets are empty, and REPLACE
	// PARTITION from an empty staging table is refused from ClickHouse 26.6).
	if err := s.Update(day("2027-05-01"), day("2027-05-02")); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "")

	// A full rebuild after incremental updates gives the same tables, and switching keeps the
	// replaced tables, ip_medians included, as _old.
	if err := s.RebuildAll(); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "_next")
	if err := s.SwitchOver(); err != nil {
		t.Fatal(err)
	}
	assertMatchesLegacy(t, conn, "")
	if ok, _ := s.tableExists("ip_medians_old"); !ok {
		t.Fatal("the replaced ip_medians should be kept as ip_medians_old")
	}
}

// A bucket whose tests are all gone (e.g. a test day re-ingested elsewhere) must be emptied,
// not refused: from ClickHouse 26.6 REPLACE PARTITION from an empty staging table fails.
func TestUpdateEmptiesBucketWithoutTests(t *testing.T) {
	t.Parallel()
	conn := testConn(t)
	f := newFixture(t, conn)
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	f.insert(t, conn, day("2026-02-01"), day("2026-03-01"), 500)
	opts := DefaultSummarizerOptions
	opts.Parallel = 8
	s := NewSummarizer(conn, opts)
	if err := s.RebuildAll(); err != nil {
		t.Fatal(err)
	}
	if err := s.SwitchOver(); err != nil {
		t.Fatal(err)
	}
	mustExec(t, conn, "TRUNCATE TABLE tests")
	if err := s.Update(day("2026-02-01"), day("2026-02-28")); err != nil {
		t.Fatal(err)
	}
	var n uint64
	if err := conn.QueryRow(context.Background(), "SELECT count() FROM summary_month WHERE year = 2026 AND month = 2").Scan(&n); err != nil {
		t.Fatal(err)
	}
	if n != 0 {
		t.Fatalf("summary_month 2026-02 should be empty, has %d rows", n)
	}
}

func TestBucketsCoverWholePeriods(t *testing.T) {
	t.Parallel()
	conn := testConn(t)
	s := NewSummarizer(conn, DefaultSummarizerOptions)
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	for _, tc := range []struct {
		window   string
		from, to string
		want     []string // partition first..last
	}{
		{"month", "2026-02-15", "2026-03-02", []string{"(2026, 2) 2026-02-01..2026-02-28", "(2026, 3) 2026-03-01..2026-03-31"}},
		{"year", "2025-12-31", "2026-01-01", []string{"2025 2025-01-01..2025-12-31", "2026 2026-01-01..2026-12-31"}},
		{"semester", "2026-06-30", "2026-07-01", []string{"(2026, 1) 2026-01-01..2026-06-30", "(2026, 2) 2026-07-01..2026-12-31"}},
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
