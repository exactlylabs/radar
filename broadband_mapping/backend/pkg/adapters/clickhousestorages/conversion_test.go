package clickhousestorages

import (
	"context"
	"fmt"
	"testing"
	"time"
)

// normalizedTests is one row per test with every field and the sorted set of its geospaces,
// independent of which geospace is in which column.
func normalizedTests(table string) string {
	return fmt.Sprintf(`
		SELECT id, time, test_style, ip, upload, mbps, min_rtt, loss_rate, latitude, longitude, location_accuracy_km,
			has_access_token, access_token_sig, asn_org_id, arraySort(%s) AS geospaces
		FROM %s t`, allGeospacesExpr, table)
}

func TestConverterCollapsesMeasurements(t *testing.T) {
	t.Parallel()
	conn := testConn(t)
	f := newFixture(t, conn)
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	// The fixture writes every test both ways; keep its tests as the expected result (tests
	// without any geospace have no measurements rows, so they can't come back).
	f.insert(t, conn, day("2025-11-20"), day("2026-03-05"), 3000)
	mustExec(t, conn, "CREATE TABLE tests_expected AS tests")
	mustExec(t, conn, "INSERT INTO tests_expected SELECT * FROM tests")
	mustExec(t, conn, "TRUNCATE TABLE tests")
	// A row ingested twice (the old cursor re-inserted its last second).
	mustExec(t, conn, "INSERT INTO measurements SELECT * FROM measurements WHERE toYYYYMM(time) = 202601 LIMIT 1")

	opts := DefaultConverterOptions
	opts.ChunkMonths = 2
	c := NewConverter(conn, opts)
	month := func(s string) time.Time { tm, _ := time.Parse("2006-01", s); return tm }

	// Stopped after the first months, then resumed over a wider range.
	if err := c.Convert(month("2025-11"), month("2025-12")); err != nil {
		t.Fatal(err)
	}
	mustExec(t, conn, "INSERT INTO tests SELECT * FROM tests_expected WHERE toYYYYMM(time) = 202602") // a half-done month is replaced
	if err := c.Convert(month("2025-10"), month("2026-04")); err != nil {
		t.Fatal(err)
	}
	var logged uint64
	if err := conn.QueryRow(context.Background(), "SELECT count() FROM tests_conversion_log").Scan(&logged); err != nil {
		t.Fatal(err)
	}
	if logged != 7 {
		t.Fatalf("tests_conversion_log should have one row per month (7), has %d", logged)
	}
	assertSameRows(t, conn, "tests", "SELECT * FROM ("+normalizedTests("tests_expected")+") WHERE notEmpty(geospaces)", normalizedTests("tests"))

	// The primary geospace of a namespace is the smallest as a string, like the ingestor's.
	var notSmallest uint64
	if err := conn.QueryRow(context.Background(), `
		SELECT count() FROM tests WHERE arrayExists(g -> (g IN (SELECT id FROM geospaces WHERE namespace = 'counties') AND toString(g) < toString(county_id))
			OR (g IN (SELECT id FROM geospaces WHERE namespace = 'tribal_tracts') AND toString(g) < toString(tribal_id)), extra_geospace_ids)`).Scan(&notSmallest); err != nil {
		t.Fatal(err)
	}
	if notSmallest != 0 {
		t.Fatalf("%d tests have an extra geospace smaller than their primary one", notSmallest)
	}

	checks, err := c.Verify(month("2025-10"), month("2026-04"))
	if err != nil {
		t.Fatal(err)
	}
	dups := uint64(0)
	for _, ch := range checks {
		if !ch.OK() {
			t.Errorf("verify: %s", ch)
		}
		dups += ch.DuplicateRows
	}
	if dups != 1 {
		t.Errorf("verify should report the duplicate row, reports %d", dups)
	}

	// Verify catches a missing month, and converting it again (Redo) restores it.
	mustExec(t, conn, "ALTER TABLE tests DROP PARTITION 202512")
	checks, err = c.Verify(month("2025-12"), month("2025-12"))
	if err != nil {
		t.Fatal(err)
	}
	if checks[0].OK() {
		t.Fatalf("verify should fail for a missing month: %s", checks[0])
	}
	redo := opts
	redo.Redo = true
	if err := NewConverter(conn, redo).Convert(month("2025-12"), month("2025-12")); err != nil {
		t.Fatal(err)
	}
	assertSameRows(t, conn, "tests", "SELECT * FROM ("+normalizedTests("tests_expected")+") WHERE notEmpty(geospaces)", normalizedTests("tests"))

	// A month without measurements ends up empty in tests (REPLACE PARTITION from an empty
	// staging table is refused from ClickHouse 26.6, so it is dropped instead).
	mustExec(t, conn, "INSERT INTO tests SELECT * FROM tests_expected WHERE toYYYYMM(time) = 202602")
	mustExec(t, conn, "ALTER TABLE tests_expected DROP PARTITION 202602")
	mustExec(t, conn, "ALTER TABLE measurements DELETE WHERE toYYYYMM(time) = 202602 SETTINGS mutations_sync = 1")
	if err := NewConverter(conn, redo).Convert(month("2026-02"), month("2026-02")); err != nil {
		t.Fatal(err)
	}
	assertSameRows(t, conn, "tests", "SELECT * FROM ("+normalizedTests("tests_expected")+") WHERE notEmpty(geospaces)", normalizedTests("tests"))
}
