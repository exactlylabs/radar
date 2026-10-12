package clickhousestorages

import (
	"context"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
)

// Converter fills tests (one row per test) from measurements (one row per test and geospace).
//
// measurements isn't partitioned and its parts span years, so reading one month touches
// ~10x the month's granules (measured on production: month by month reads 15.2 M granules,
// 13x the table; year by year 2.3 M, 1.9x). The source is therefore read in chunks of
// ChunkMonths aligned months; each chunk is collapsed (GROUP BY id, spilling to disk past
// MaxBytesBeforeExternalGroupBy) into a staging table partitioned like tests, and every month
// of the chunk is then put in tests with REPLACE PARTITION. A month is recorded in
// tests_conversion_log once it is in tests, so a run can be stopped and resumed, and running
// a month again replaces it.
type Converter struct {
	conn driver.Conn
	opts ConverterOptions
}

type ConverterOptions struct {
	ChunkMonths                   int
	MaxThreads                    int
	MaxInsertThreads              int
	MaxMemoryUsage                uint64
	MaxBytesBeforeExternalGroupBy uint64
	// Convert months already in tests_conversion_log again.
	Redo bool
}

var DefaultConverterOptions = ConverterOptions{
	ChunkMonths:                   12,
	MaxThreads:                    6,
	MaxInsertThreads:              1,
	MaxMemoryUsage:                20_000_000_000,
	MaxBytesBeforeExternalGroupBy: 6_000_000_000,
}

const (
	conversionLog     = "tests_conversion_log"
	conversionStaging = "tests_conv_staging"
)

func NewConverter(conn driver.Conn, opts ConverterOptions) *Converter {
	if opts.ChunkMonths < 1 {
		opts.ChunkMonths = 1
	}
	if opts.MaxInsertThreads < 1 {
		opts.MaxInsertThreads = 1
	}
	return &Converter{conn: conn, opts: opts}
}

func (c *Converter) ctx() context.Context {
	return clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
		"max_threads":                        c.opts.MaxThreads,
		"max_insert_threads":                 c.opts.MaxInsertThreads,
		"max_memory_usage":                   c.opts.MaxMemoryUsage,
		"max_bytes_before_external_group_by": c.opts.MaxBytesBeforeExternalGroupBy,
		"async_insert":                       0,
	}))
}

func (c *Converter) exec(query string, args ...any) error {
	return c.conn.Exec(c.ctx(), query, args...)
}

// month is a calendar month as YYYYMM.
type month int

func monthOf(t time.Time) month { return month(t.UTC().Year()*100 + int(t.UTC().Month())) }

func (m month) start() time.Time {
	return time.Date(int(m)/100, time.Month(int(m)%100), 1, 0, 0, 0, 0, time.UTC)
}
func (m month) next() month    { return monthOf(m.start().AddDate(0, 1, 0)) }
func (m month) index() int     { return int(m)/100*12 + int(m)%100 - 1 }
func (m month) String() string { return fmt.Sprintf("%d-%02d", int(m)/100, int(m)%100) }

// chunks groups the months from..to (inclusive) into runs of ChunkMonths aligned months
// (with 12, calendar years).
func (c *Converter) chunks(from, to month) [][]month {
	result := [][]month{}
	for m := from; m <= to; m = m.next() {
		if len(result) == 0 || m.index()/c.opts.ChunkMonths != result[len(result)-1][0].index()/c.opts.ChunkMonths {
			result = append(result, []month{})
		}
		result[len(result)-1] = append(result[len(result)-1], m)
	}
	return result
}

func monthList(months []month) string {
	s := make([]string, len(months))
	for i, m := range months {
		s[i] = fmt.Sprint(int(m))
	}
	return strings.Join(s, ", ")
}

// Convert converts the months from..to (inclusive) that aren't converted yet (all of them with Redo).
func (c *Converter) Convert(from, to time.Time) error {
	if err := c.exec(fmt.Sprintf(`CREATE TABLE IF NOT EXISTS %s (month UInt32, tests UInt64, invalid_ips UInt64, finished DateTime('UTC'))
		ENGINE = ReplacingMergeTree(finished) ORDER BY month`, conversionLog)); err != nil {
		return errors.Wrap(err, "converter#Convert create log")
	}
	done, err := c.convertedMonths()
	if err != nil {
		return err
	}
	for _, chunk := range c.chunks(monthOf(from), monthOf(to)) {
		pending := []month{}
		for _, m := range chunk {
			if c.opts.Redo || !done[m] {
				pending = append(pending, m)
			}
		}
		if len(pending) == 0 {
			continue
		}
		if err := c.convertChunk(pending); err != nil {
			return err
		}
	}
	return nil
}

func (c *Converter) convertedMonths() (map[month]bool, error) {
	rows, err := c.conn.Query(c.ctx(), fmt.Sprintf("SELECT DISTINCT month FROM %s", conversionLog))
	if err != nil {
		return nil, errors.Wrap(err, "converter#convertedMonths")
	}
	defer rows.Close()
	done := map[month]bool{}
	for rows.Next() {
		var m uint32
		if err := rows.Scan(&m); err != nil {
			return nil, errors.Wrap(err, "converter#convertedMonths Scan")
		}
		done[month(m)] = true
	}
	return done, rows.Err()
}

// collapseQuery selects one tests row per id from the measurements matching filter. The
// geospace columns take the smallest geospace of their namespace; the test's other geospaces
// (a second county, a second tribal area, unknown namespaces) go to extra_geospace_ids.
// Duplicate (id, geospace) rows collapse into one.
func collapseQuery(filter string) string {
	return fmt.Sprintf(`
		SELECT c_time, c_id, c_test_style, c_ip, c_upload, c_mbps, c_min_rtt, c_loss_rate, c_latitude, c_longitude,
			c_location_accuracy_km, c_has_access_token, c_access_token_sig, c_asn_org_id, c_state_id, c_county_id, c_tribal_id,
			arraySort(arrayFilter(g -> g != ifNull(c_state_id, toUUID('00000000-0000-0000-0000-000000000000'))
				AND g != ifNull(c_county_id, toUUID('00000000-0000-0000-0000-000000000000'))
				AND g != ifNull(c_tribal_id, toUUID('00000000-0000-0000-0000-000000000000')), c_geospaces))
		FROM (
			SELECT
				m.id AS c_id,
				any(m.time) AS c_time,
				any(m.test_style) AS c_test_style,
				toIPv6OrDefault(any(m.ip)) AS c_ip,
				any(m.upload) AS c_upload,
				any(m.mbps) AS c_mbps,
				any(m.min_rtt) AS c_min_rtt,
				any(m.loss_rate) AS c_loss_rate,
				any(m.latitude) AS c_latitude,
				any(m.longitude) AS c_longitude,
				any(m.location_accuracy_km) AS c_location_accuracy_km,
				any(m.has_access_token) AS c_has_access_token,
				any(m.access_token_sig) AS c_access_token_sig,
				any(m.asn_org_id) AS c_asn_org_id,
				minIf(toNullable(m.geospace_id), m.geospace_id IN (SELECT id FROM geospaces WHERE namespace = 'states')) AS c_state_id,
				minIf(toNullable(m.geospace_id), m.geospace_id IN (SELECT id FROM geospaces WHERE namespace = 'counties')) AS c_county_id,
				minIf(toNullable(m.geospace_id), m.geospace_id IN (SELECT id FROM geospaces WHERE namespace = 'tribal_tracts')) AS c_tribal_id,
				groupUniqArray(m.geospace_id) AS c_geospaces
			FROM measurements m
			WHERE %s
			GROUP BY m.id
		)`, filter)
}

const testsColumns = `time, id, test_style, ip, upload, mbps, min_rtt, loss_rate, latitude, longitude,
	location_accuracy_km, has_access_token, access_token_sig, asn_org_id, state_id, county_id, tribal_id, extra_geospace_ids`

func (c *Converter) convertChunk(months []month) error {
	start := time.Now()
	first, last := months[0], months[len(months)-1]
	log.Printf("converter: reading %s..%s from measurements\n", first, last)
	if err := c.exec("DROP TABLE IF EXISTS " + conversionStaging); err != nil {
		return errors.Wrap(err, "converter#convertChunk drop staging")
	}
	if err := c.exec(fmt.Sprintf("CREATE TABLE %s AS tests", conversionStaging)); err != nil {
		return errors.Wrap(err, "converter#convertChunk create staging")
	}
	defer c.exec("DROP TABLE IF EXISTS " + conversionStaging)
	// The time range uses measurements' minmax index; the month list skips converted months.
	filter := fmt.Sprintf("m.time >= toDateTime('%s', 'UTC') AND m.time < toDateTime('%s', 'UTC') AND toYYYYMM(m.time) IN (%s)",
		first.start().Format("2006-01-02"), last.next().start().Format("2006-01-02"), monthList(months))
	if err := c.exec(fmt.Sprintf("INSERT INTO %s (%s) %s", conversionStaging, testsColumns, collapseQuery(filter))); err != nil {
		return errors.Wrap(err, "converter#convertChunk insert")
	}
	log.Printf("converter: collapsed %s..%s in %v\n", first, last, time.Since(start))
	for _, m := range months {
		var tests, invalid uint64
		if err := c.conn.QueryRow(c.ctx(), fmt.Sprintf(
			"SELECT count(), countIf(ip = toIPv6('::')) FROM %s WHERE toYYYYMM(time) = %d", conversionStaging, int(m))).Scan(&tests, &invalid); err != nil {
			return errors.Wrap(err, "converter#convertChunk count")
		}
		if err := replacePartition(c.ctx(), c.conn, "tests", fmt.Sprint(int(m)), conversionStaging); err != nil {
			return err
		}
		if err := c.exec(fmt.Sprintf("INSERT INTO %s (month, tests, invalid_ips, finished) VALUES (?, ?, ?, now())", conversionLog),
			uint32(m), tests, invalid); err != nil {
			return errors.Wrap(err, "converter#convertChunk log")
		}
		log.Printf("converter: %s: %d tests (%d without a valid ip)\n", m, tests, invalid)
	}
	log.Printf("converter: %s..%s done in %v\n", first, last, time.Since(start))
	return nil
}

// MonthCheck compares one month of measurements and tests.
type MonthCheck struct {
	Month           string
	MeasurementIDs  uint64 // distinct ids in measurements
	MeasurementRows uint64
	Tests           uint64 // rows in tests
	TestIDs         uint64 // distinct ids in tests
	// Geospaces whose (test, geospace) count differs between the two tables, after collapsing
	// duplicate (id, geospace) rows of measurements.
	GeospaceDiffs []string
	// Duplicate (id, geospace) rows in measurements; the legacy summaries counted them twice.
	DuplicateRows uint64
}

func (m MonthCheck) OK() bool {
	return m.MeasurementIDs == m.Tests && m.Tests == m.TestIDs && len(m.GeospaceDiffs) == 0
}

func (m MonthCheck) String() string {
	status := "OK"
	if !m.OK() {
		status = "DIFF"
	}
	s := fmt.Sprintf("%s %s measurements: %d rows, %d ids; tests: %d rows, %d ids", m.Month, status, m.MeasurementRows, m.MeasurementIDs, m.Tests, m.TestIDs)
	if m.DuplicateRows > 0 {
		s += fmt.Sprintf("; %d duplicate (id, geospace) rows in measurements", m.DuplicateRows)
	}
	if len(m.GeospaceDiffs) > 0 {
		s += fmt.Sprintf("; %d geospaces differ: %s", len(m.GeospaceDiffs), strings.Join(m.GeospaceDiffs, " "))
	}
	return s
}

// Verify compares measurements and tests month by month: distinct ids in measurements must
// equal the rows of tests (and tests' distinct ids), and every geospace must have as many
// (test, geospace) pairs in tests as distinct ids in measurements. measurements is read in
// the same chunks as Convert; distinct ids are counted on cityHash64(id) (collisions are
// negligible at this size: ~0.01 expected among 10^9 ids) with GROUP BY so they spill to disk.
func (c *Converter) Verify(from, to time.Time) ([]MonthCheck, error) {
	result := []MonthCheck{}
	for _, chunk := range c.chunks(monthOf(from), monthOf(to)) {
		checks, err := c.verifyChunk(chunk)
		if err != nil {
			return nil, err
		}
		for _, m := range checks {
			log.Println("verify:", m)
		}
		result = append(result, checks...)
	}
	return result, nil
}

type monthGeo struct {
	month    month
	geospace string
}

func (c *Converter) verifyChunk(months []month) ([]MonthCheck, error) {
	first, last := months[0], months[len(months)-1]
	timeFilter := func(col string) string {
		return fmt.Sprintf("%[1]s >= toDateTime('%[2]s', 'UTC') AND %[1]s < toDateTime('%[3]s', 'UTC')",
			col, first.start().Format("2006-01-02"), last.next().start().Format("2006-01-02"))
	}
	checks := map[month]*MonthCheck{}
	for _, m := range months {
		checks[m] = &MonthCheck{Month: m.String()}
	}

	// measurements: rows and distinct ids per month, (id, geospace) pairs per geospace.
	if err := c.query(fmt.Sprintf(`
		SELECT m, count(), sum(n) FROM (
			SELECT toYYYYMM(time) AS m, cityHash64(id) AS h, count() AS n FROM measurements WHERE %s GROUP BY m, h
		) GROUP BY m`, timeFilter("time")), func(rows driver.Rows) error {
		var m uint32
		var ids, n uint64
		if err := rows.Scan(&m, &ids, &n); err != nil {
			return err
		}
		if ch := checks[month(m)]; ch != nil {
			ch.MeasurementIDs, ch.MeasurementRows = ids, n
		}
		return nil
	}); err != nil {
		return nil, err
	}
	pairs := map[monthGeo]uint64{}
	if err := c.query(fmt.Sprintf(`
		SELECT m, toString(geospace_id), count(), sum(n) FROM (
			SELECT toYYYYMM(time) AS m, geospace_id, cityHash64(id) AS h, count() AS n FROM measurements WHERE %s GROUP BY m, geospace_id, h
		) GROUP BY m, geospace_id`, timeFilter("time")), func(rows driver.Rows) error {
		var m uint32
		var g string
		var ids, n uint64
		if err := rows.Scan(&m, &g, &ids, &n); err != nil {
			return err
		}
		pairs[monthGeo{month(m), g}] = ids
		if ch := checks[month(m)]; ch != nil {
			ch.DuplicateRows += n - ids
		}
		return nil
	}); err != nil {
		return nil, err
	}
	// tests: rows and distinct ids per month, tests per geospace.
	if err := c.query(fmt.Sprintf(`
		SELECT toYYYYMM(time) AS m, count(), uniqExact(cityHash64(id)) FROM tests WHERE %s GROUP BY m`, timeFilter("time")), func(rows driver.Rows) error {
		var m uint32
		var n, ids uint64
		if err := rows.Scan(&m, &n, &ids); err != nil {
			return err
		}
		if ch := checks[month(m)]; ch != nil {
			ch.Tests, ch.TestIDs = n, ids
		}
		return nil
	}); err != nil {
		return nil, err
	}
	if err := c.query(fmt.Sprintf(`
		SELECT toYYYYMM(t.time) AS m, toString(g), count() FROM tests t ARRAY JOIN %s AS g WHERE %s GROUP BY m, g`,
		allGeospacesExpr, timeFilter("t.time")), func(rows driver.Rows) error {
		var m uint32
		var g string
		var n uint64
		if err := rows.Scan(&m, &g, &n); err != nil {
			return err
		}
		key := monthGeo{month(m), g}
		if pairs[key] != n {
			if ch := checks[month(m)]; ch != nil {
				ch.GeospaceDiffs = append(ch.GeospaceDiffs, fmt.Sprintf("%s(%d!=%d)", g, n, pairs[key]))
			}
		}
		delete(pairs, key)
		return nil
	}); err != nil {
		return nil, err
	}
	for key, n := range pairs {
		if ch := checks[key.month]; ch != nil {
			ch.GeospaceDiffs = append(ch.GeospaceDiffs, fmt.Sprintf("%s(0!=%d)", key.geospace, n))
		}
	}
	result := []MonthCheck{}
	for _, m := range months {
		sort.Strings(checks[m].GeospaceDiffs)
		result = append(result, *checks[m])
	}
	return result, nil
}

func (c *Converter) query(query string, f func(rows driver.Rows) error) error {
	rows, err := c.conn.Query(c.ctx(), query)
	if err != nil {
		return errors.Wrap(err, "converter#query")
	}
	defer rows.Close()
	for rows.Next() {
		if err := f(rows); err != nil {
			return errors.Wrap(err, "converter#query Scan")
		}
	}
	return wrap(rows.Err(), "converter#query rows")
}
