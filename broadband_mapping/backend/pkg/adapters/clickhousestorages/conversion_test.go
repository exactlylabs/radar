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

// exactTests is every column of a tests table, NULLs as '-', for a byte-level comparison.
func exactTests(table string) string {
	return fmt.Sprintf(`
		SELECT time, id, test_style, ip, upload, mbps, min_rtt, loss_rate, latitude, longitude, location_accuracy_km,
			has_access_token, access_token_sig, asn_org_id, ifNull(toString(state_id), '-') AS state_id,
			ifNull(toString(county_id), '-') AS county_id, ifNull(toString(tribal_id), '-') AS tribal_id, extra_geospace_ids
		FROM %s`, table)
}

func TestConverterCollapsesMeasurements(t *testing.T) {
	t.Parallel()
	for _, strategy := range []string{StrategyJoin, StrategyGroupBy} {
		t.Run(strategy, func(t *testing.T) {
			t.Parallel()
			testConverterCollapsesMeasurements(t, strategy)
		})
	}
}

func testConverterCollapsesMeasurements(t *testing.T, strategy string) {
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
	opts.Strategy = strategy
	opts.ChunkMonths = 2
	opts.Shards = 3              // every chunk collapsed in three hash shards; the result must not change
	opts.ClassifyShardRows = 700 // join: a month classified in several hash shards
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
	if strategy == StrategyJoin {
		// The fixture's tests mostly have one county and its parent state: those must have
		// come from their county row, the rest (two counties, no state, a state that isn't
		// the parent, tribal, unknown, duplicate) through the GROUP BY.
		s := c.Stats
		if s.ExceptionIDs == 0 || s.FastTests == 0 || s.FastTests < s.ExceptionIDs {
			t.Fatalf("join strategy stats of the last chunk: %+v", s)
		}
	}

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

// Both strategies must give byte-identical tests rows: every column, including which
// geospace is in which column and the order of extra_geospace_ids.
func TestConverterStrategiesAgree(t *testing.T) {
	t.Parallel()
	conn := testConn(t)
	f := newFixture(t, conn)
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	f.insert(t, conn, day("2025-12-20"), day("2026-02-10"), 4000)
	mustExec(t, conn, "TRUNCATE TABLE tests")
	mustExec(t, conn, "INSERT INTO measurements SELECT * FROM measurements WHERE toYYYYMM(time) = 202601 LIMIT 5")
	month := func(s string) time.Time { tm, _ := time.Parse("2006-01", s); return tm }

	opts := DefaultConverterOptions
	opts.Strategy = StrategyGroupBy
	if err := NewConverter(conn, opts).Convert(month("2025-12"), month("2026-02")); err != nil {
		t.Fatal(err)
	}
	mustExec(t, conn, "CREATE TABLE tests_groupby AS tests")
	mustExec(t, conn, "INSERT INTO tests_groupby SELECT * FROM tests")
	mustExec(t, conn, "TRUNCATE TABLE tests")

	opts.Strategy = StrategyJoin
	opts.Redo = true
	opts.ClassifyShardRows = 1000
	c := NewConverter(conn, opts)
	if err := c.Convert(month("2025-12"), month("2026-02")); err != nil {
		t.Fatal(err)
	}
	if c.Stats.FastTests == 0 || c.Stats.ExceptionIDs == 0 {
		t.Fatalf("join strategy stats: %+v", c.Stats)
	}
	assertSameRows(t, conn, "tests", exactTests("tests_groupby"), exactTests("tests"))
}

// Tests that lost their UUID in the first processor all have id ERROR_DISCOVERING_UUID in
// measurements: the conversion must key them by their content, one test each, and the
// repair must turn an older conversion's one collapsed row per month into the same tests.
func TestConverterKeysUnknownIDsByContent(t *testing.T) {
	t.Parallel()
	conn := testConn(t)
	f := newFixture(t, conn)
	day := func(s string) time.Time { tm, _ := time.Parse("2006-01-02", s); return tm }
	f.insert(t, conn, day("2026-01-05"), day("2026-01-20"), 400)
	mustExec(t, conn, "CREATE TABLE tests_expected AS tests")
	mustExec(t, conn, "INSERT INTO tests_expected SELECT * FROM tests")
	mustExec(t, conn, "TRUNCATE TABLE tests")
	// 7 tests lose their UUID: every measurements row of theirs gets the unknown id.
	mustExec(t, conn, "CREATE TABLE lost ENGINE = Memory AS SELECT id FROM tests_expected ORDER BY id LIMIT 7")
	// (an explicit column list: SELECT * REPLACE kept the id on ClickHouse 26.8)
	mustExec(t, conn, `INSERT INTO measurements (id, test_style, ip, time, upload, mbps, loss_rate, min_rtt, latitude, longitude,
		location_accuracy_km, has_access_token, access_token_sig, asn_org_id, geospace_id)
		SELECT '`+unknownID+`', test_style, ip, time, upload, mbps, loss_rate, min_rtt, latitude, longitude,
		location_accuracy_km, has_access_token, access_token_sig, asn_org_id, geospace_id FROM measurements WHERE id IN (SELECT id FROM lost)`)
	mustExec(t, conn, "ALTER TABLE measurements DELETE WHERE id IN (SELECT id FROM lost) SETTINGS mutations_sync = 1")
	// Their ids are hashes now: compare everything but those ids.
	mustExec(t, conn, "ALTER TABLE tests_expected UPDATE id = '' WHERE id IN (SELECT id FROM lost) SETTINGS mutations_sync = 1")
	want := "SELECT * REPLACE (if(startsWith(id, 'ERR-'), '', id) AS id) FROM (" + normalizedTests("tests_expected") + ") WHERE notEmpty(geospaces)"
	got := "SELECT * REPLACE (if(startsWith(id, 'ERR-'), '', id) AS id) FROM (" + normalizedTests("tests") + ")"
	assertKeyed := func(step string) {
		t.Helper()
		assertSameRows(t, conn, "tests ("+step+")", want, got)
		var keyed, unknown uint64
		if err := conn.QueryRow(context.Background(), "SELECT uniqExact(id), countIf(id = '"+unknownID+"') FROM tests WHERE startsWith(id, 'ERR-') OR id = '"+unknownID+"'").Scan(&keyed, &unknown); err != nil {
			t.Fatal(err)
		}
		if keyed != 7 || unknown != 0 {
			t.Fatalf("%s: %d tests keyed by content (want 7), %d rows still with the unknown id", step, keyed, unknown)
		}
	}
	month := func(s string) time.Time { tm, _ := time.Parse("2006-01", s); return tm }
	for _, strategy := range []string{StrategyGroupBy, StrategyJoin} {
		opts := DefaultConverterOptions
		opts.Strategy = strategy
		opts.Redo = true
		opts.Shards = 2
		if err := NewConverter(conn, opts).Convert(month("2026-01"), month("2026-01")); err != nil {
			t.Fatal(err)
		}
		assertKeyed(strategy)
	}
	checks, err := NewConverter(conn, DefaultConverterOptions).Verify(month("2026-01"), month("2026-01"))
	if err != nil {
		t.Fatal(err)
	}
	if !checks[0].OK() {
		t.Fatalf("verify after conversion: %s", checks[0])
	}

	// An older conversion collapsed the 7 into one row with the unknown id; the repair
	// restores them, and verify sees the collapsed row as a difference before it.
	mustExec(t, conn, `CREATE TABLE collapsed ENGINE = Memory AS SELECT time, '`+unknownID+`' AS id, test_style, ip, upload, mbps, min_rtt, loss_rate, latitude, longitude,
		location_accuracy_km, has_access_token, access_token_sig, asn_org_id, state_id, county_id, tribal_id, extra_geospace_ids
		FROM tests WHERE startsWith(id, 'ERR-') LIMIT 1`)
	mustExec(t, conn, "INSERT INTO tests ("+testsColumns+") SELECT "+testsColumns+" FROM collapsed")
	mustExec(t, conn, "ALTER TABLE tests DELETE WHERE startsWith(id, 'ERR-') SETTINGS mutations_sync = 1")
	checks, err = NewConverter(conn, DefaultConverterOptions).Verify(month("2026-01"), month("2026-01"))
	if err != nil {
		t.Fatal(err)
	}
	if checks[0].OK() {
		t.Fatalf("verify should see the collapsed row: %s", checks[0])
	}
	opts := DefaultConverterOptions
	opts.Shards = 2
	if err := NewConverter(conn, opts).RepairUnknownIDs(month("2026-01"), month("2026-01")); err != nil {
		t.Fatal(err)
	}
	assertKeyed("repair")
}
