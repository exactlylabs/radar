package clickhousestorages

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/google/uuid"
)

// Tests the API read paths (summary_<window>, summary_geospace_<window>, geospaces, asn_orgs)
// against a real ClickHouse. Needs CLICKHOUSE_TEST_ADDR (e.g. 127.0.0.1:19000).

func apiQueryTestConn(t *testing.T) driver.Conn {
	addr := os.Getenv("CLICKHOUSE_TEST_ADDR")
	if addr == "" {
		t.Skip("CLICKHOUSE_TEST_ADDR not set")
	}
	admin, err := clickhouse.Open(&clickhouse.Options{Addr: []string{addr}})
	if err != nil {
		t.Fatal(err)
	}
	db := fmt.Sprintf("api_queries_test_%d", time.Now().UnixNano())
	if err := admin.Exec(context.Background(), "CREATE DATABASE "+db); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		admin.Exec(context.Background(), "DROP DATABASE "+db)
		admin.Close()
	})
	// One connection: a leaked (unclosed) result set would block the next query.
	conn, err := clickhouse.Open(&clickhouse.Options{Addr: []string{addr}, Auth: clickhouse.Auth{Database: db}, MaxOpenConns: 1, DialTimeout: 5 * time.Second})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { conn.Close() })
	for _, f := range []string{"001_geospaces.sql", "002_asn_orgs.sql"} {
		sql, err := os.ReadFile(filepath.Join("..", "..", "..", "migrations", f))
		if err != nil {
			t.Fatal(err)
		}
		apiMustExec(t, conn, string(sql))
	}
	// Same columns and keys as the summarizer's month tables (the API's table contract).
	common := "med_mbps Float64, med_min_rtt Float64, bad_count UInt64, normal_count UInt64, good_count UInt64, total_samples UInt64, geospace_id UUID"
	apiMustExec(t, conn, "CREATE TABLE summary_geospace_month ("+common+", upload Bool, year UInt16, month UInt8) ENGINE = MergeTree PARTITION BY (year, month) ORDER BY (upload, geospace_id, year, month)")
	apiMustExec(t, conn, "CREATE TABLE summary_month ("+common+", asn_org_id UUID, upload Bool, year UInt16, month UInt8) ENGINE = MergeTree PARTITION BY (year, month) ORDER BY (upload, geospace_id, asn_org_id, year, month)")
	apiMustExec(t, conn, "CREATE TABLE summary_geospace_alltime ("+common+", upload Bool) ENGINE = MergeTree ORDER BY (upload, geospace_id)")
	return conn
}

func apiMustExec(t *testing.T, conn driver.Conn, query string, args ...any) {
	t.Helper()
	if err := conn.Exec(context.Background(), query, args...); err != nil {
		t.Fatalf("%v\n%s", err, query)
	}
}

type apiFixture struct {
	state, county1, county2, ttract string
	asn1, asn2                      string
}

func newAPIFixture(t *testing.T, conn driver.Conn) apiFixture {
	f := apiFixture{
		state: uuid.NewString(), county1: uuid.NewString(), county2: uuid.NewString(), ttract: uuid.NewString(),
		asn1: uuid.NewString(), asn2: uuid.NewString(),
	}
	geos := `INSERT INTO geospaces (id, name, namespace, geo_id, centroid_lat, centroid_long, parent_id) VALUES`
	apiMustExec(t, conn, geos+` (?, 'Ohio', ?, '39', 40.1, -82.5, NULL)`, f.state, string(namespaces.US_STATE))
	apiMustExec(t, conn, geos+` (?, 'Franklin', ?, '39049', 39.9, -83.0, ?)`, f.county1, string(namespaces.US_COUNTY), f.state)
	apiMustExec(t, conn, geos+` (?, 'Delaware', ?, '39041', 40.2, -83.0, ?)`, f.county2, string(namespaces.US_COUNTY), f.state)
	apiMustExec(t, conn, geos+` (?, 'Tract', ?, 'T1', 35.0, -100.0, NULL)`, f.ttract, string(namespaces.US_TTRACT))
	apiMustExec(t, conn, `INSERT INTO asn_orgs (id, name) VALUES (?, 'ISP One'), (?, 'ISP Two')`, f.asn1, f.asn2)

	geoRow := `INSERT INTO summary_geospace_month VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	asnRow := `INSERT INTO summary_month VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	for i, g := range []string{f.state, f.county1, f.county2, f.ttract} {
		for _, up := range []bool{false, true} {
			for _, m := range []uint8{1, 2} {
				base := float64(100*(i+1)) + float64(m)
				if up {
					base /= 10
				}
				apiMustExec(t, conn, geoRow, base, 10.0+float64(i), uint64(1), uint64(2), uint64(7), uint64(10), g, up, uint16(2024), m)
				for j, a := range []string{f.asn1, f.asn2} {
					apiMustExec(t, conn, asnRow, base+float64(j+1)*1000, 20.0+float64(j), uint64(2), uint64(3), uint64(5), uint64(10), g, a, up, uint16(2024), m)
				}
			}
		}
	}
	apiMustExec(t, conn, `INSERT INTO summary_geospace_alltime VALUES (55.5, 12.5, 1, 1, 2, 4, ?, false), (5.5, 12.5, 1, 1, 2, 4, ?, true)`, f.county1, f.county1)
	return f
}

func intp(v int) *int { return &v }

func TestSummaryQueriesAgainstClickHouse(t *testing.T) {
	conn := apiQueryTestConn(t)
	f := newAPIFixture(t, conn)
	ss := NewSummariesStorage(conn)
	feb := storages.SummaryFilter{Year: intp(2024), Month: intp(2)}

	t.Run("namespace", func(t *testing.T) {
		res, err := ss.SummaryForNamespace(namespaces.US_COUNTY, feb)
		if err != nil {
			t.Fatal(err)
		}
		sort.Slice(res, func(i, j int) bool { return res[i].Geospace.GeoId < res[j].Geospace.GeoId })
		if len(res) != 2 {
			t.Fatalf("want 2 counties, got %d", len(res))
		}
		// county2 (Delaware, 39041) has i=2: download 302, upload 30.2
		d := res[0]
		if d.Geospace.Id != f.county2 || *d.Geospace.Name != "Delaware" || d.DownloadMedian != 302 || d.UploadMedian != 30.2 || d.LatencyMedian != 12 {
			t.Fatalf("unexpected summary %+v", d)
		}
		if d.Geospace.Namespace != namespaces.US_COUNTY || d.Geospace.Centroid != [2]float64{40.2, -83.0} {
			t.Fatalf("unexpected geospace %+v", d.Geospace)
		}
		if d.Geospace.Parent == nil || d.Geospace.Parent.Id != f.state || d.Geospace.Parent.Namespace != namespaces.US_STATE || d.Geospace.Parent.GeoId != "39" {
			t.Fatalf("unexpected parent %+v", d.Geospace.Parent)
		}
		if d.DownloadScores != (storages.MeasurementScore{Bad: 0.1, Medium: 0.2, Good: 0.7, TotalSamples: 10}) {
			t.Fatalf("unexpected scores %+v", d.DownloadScores)
		}
		if d.ASNOrg != nil {
			t.Fatalf("unexpected asn %+v", d.ASNOrg)
		}
		states, err := ss.SummaryForNamespace(namespaces.US_STATE, feb)
		if err != nil {
			t.Fatal(err)
		}
		if len(states) != 1 || states[0].Geospace.Parent != nil || states[0].DownloadMedian != 102 {
			t.Fatalf("unexpected states %+v", states)
		}
	})

	t.Run("namespace and asn", func(t *testing.T) {
		res, err := ss.SummaryForNamespaceAndASN(namespaces.US_COUNTY, f.asn2, feb)
		if err != nil {
			t.Fatal(err)
		}
		sort.Slice(res, func(i, j int) bool { return res[i].Geospace.GeoId < res[j].Geospace.GeoId })
		if len(res) != 2 {
			t.Fatalf("want 2 counties, got %d", len(res))
		}
		d := res[1] // Franklin, i=1: base 202 / 20.2, asn2 adds 2000
		if d.Geospace.Id != f.county1 || d.DownloadMedian != 2202 || d.UploadMedian != 2020.2 || d.LatencyMedian != 21 {
			t.Fatalf("unexpected summary %+v", d)
		}
		if d.ASNOrg == nil || d.ASNOrg.Id != f.asn2 || d.ASNOrg.Organization != "ISP Two" {
			t.Fatalf("unexpected asn %+v", d.ASNOrg)
		}
		if d.Geospace.Parent == nil || d.Geospace.Parent.Id != f.state {
			t.Fatalf("unexpected parent %+v", d.Geospace.Parent)
		}
		none, err := ss.SummaryForNamespaceAndASN(namespaces.US_COUNTY, uuid.NewString(), feb)
		if err != nil || len(none) != 0 {
			t.Fatalf("unknown asn: %v %+v", err, none)
		}
	})

	t.Run("geospace", func(t *testing.T) {
		res, err := ss.SummaryForGeospace(f.county1, storages.SummaryFilter{Year: intp(2024), Month: intp(1)})
		if err != nil {
			t.Fatal(err)
		}
		if res.Geospace.Id != f.county1 || res.Geospace.Namespace != namespaces.US_COUNTY || res.DownloadMedian != 201 || res.UploadMedian != 20.1 {
			t.Fatalf("unexpected %+v", res)
		}
		if res.Geospace.Parent == nil || *res.Geospace.Parent.Name != "Ohio" {
			t.Fatalf("unexpected parent %+v", res.Geospace.Parent)
		}
		all, err := ss.SummaryForGeospace(f.county1, storages.SummaryFilter{})
		if err != nil {
			t.Fatal(err)
		}
		if all.DownloadMedian != 55.5 || all.UploadMedian != 5.5 || all.DownloadScores.TotalSamples != 4 {
			t.Fatalf("unexpected alltime %+v", all)
		}
		empty, err := ss.SummaryForGeospace(uuid.NewString(), feb)
		if err != nil || empty.Geospace.Id != "" {
			t.Fatalf("unknown geospace: %v %+v", err, empty)
		}
	})

	t.Run("geospace and asn", func(t *testing.T) {
		res, err := ss.SummaryForGeoAndASN(f.county2, f.asn1, feb)
		if err != nil {
			t.Fatal(err)
		}
		if res.Geospace.Id != f.county2 || res.DownloadMedian != 1302 || res.UploadMedian != 1030.2 {
			t.Fatalf("unexpected %+v", res)
		}
		if res.ASNOrg == nil || res.ASNOrg.Id != f.asn1 || res.ASNOrg.Organization != "ISP One" {
			t.Fatalf("unexpected asn %+v", res.ASNOrg)
		}
	})

	t.Run("query error releases the connection", func(t *testing.T) {
		// A failing query must not keep the only connection busy.
		if _, err := ss.SummaryForGeospace("not-a-uuid", feb); err == nil {
			t.Fatal("expected an error for an invalid id")
		}
		if _, err := ss.SummaryForGeospace(f.county1, feb); err != nil {
			t.Fatal(err)
		}
	})
}

// TestSummaryQueriesPruneBeforeJoin checks that the ASN filter reaches the summary table read:
// with the filter in the subquery ClickHouse reads only the matching granules of summary_month.
func TestSummaryQueriesPruneBeforeJoin(t *testing.T) {
	conn := apiQueryTestConn(t)
	f := newAPIFixture(t, conn)
	query, args, err := summaryAsnQuery(namespaces.US_COUNTY, f.asn1, storages.SummaryFilter{Year: intp(2024), Month: intp(2)})
	if err != nil {
		t.Fatal(err)
	}
	rows, err := conn.Query(context.Background(), "EXPLAIN indexes = 1 "+query, args...)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	var plan []string
	for rows.Next() {
		var line string
		if err := rows.Scan(&line); err != nil {
			t.Fatal(err)
		}
		plan = append(plan, line)
	}
	text := strings.Join(plan, "\n")
	if !strings.Contains(text, "Partition") || !strings.Contains(text, "PrimaryKey") {
		t.Fatalf("expected partition and primary key pruning on summary_month:\n%s", text)
	}
}
