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
// ChunkMonths aligned months; each chunk is collapsed into a staging table partitioned like
// tests (see Strategy), and every month of the chunk is then put in tests with REPLACE
// PARTITION. A month is recorded in tests_conversion_log once it is in tests, so a run can
// be stopped and resumed, and running a month again replaces it.
type Converter struct {
	conn driver.Conn
	opts ConverterOptions
	// Stats of the last chunk converted with StrategyJoin.
	Stats JoinStats
}

// Conversion strategies. Both give byte-identical tests rows.
const (
	// StrategyGroupBy collapses every row of the chunk with one GROUP BY id (40-byte string
	// keys, ~500 B of aggregate state per test): exact and simple, but a year of production
	// spills tens of GB and ran at ~330 k source rows/s.
	StrategyGroupBy = "groupby"
	// StrategyJoin handles the common test (exactly one county row and one state row, the
	// state being the county's parent in geospaces; ~98 % of production) from its county row
	// alone: that row is read by primary key (geospace_id IN counties), county_id is its
	// geospace, state_id the county's parent, tribal_id NULL, extra_geospace_ids []. A
	// classification pass (GROUP BY id with a 32-byte state, in shards that fit in memory)
	// lists the other ids exactly; those ~2 % go through the GROUP BY of StrategyGroupBy.
	StrategyJoin = "join"
)

// JoinStats counts what StrategyJoin did for a chunk.
type JoinStats struct {
	SourceRows   uint64 // measurements rows of the chunk
	ExceptionIDs uint64 // tests collapsed with the GROUP BY
	FastTests    uint64 // tests taken from their county row
}

type ConverterOptions struct {
	// Strategy is StrategyJoin (default) or StrategyGroupBy.
	Strategy    string
	ChunkMonths int
	// StrategyJoin classifies the ids of each month in shards of at most ClassifyShardRows
	// source rows (hash shards of the month's rows) so the classification never spills:
	// it takes classifyBytesPerRow of memory per row. 0 = 60 % of MaxMemoryUsage.
	ClassifyShardRows uint64
	// A chunk's GROUP BY id (StrategyGroupBy: every row; StrategyJoin: the exceptions' rows)
	// is split into shards by cityHash64(id) % n (every row of a test has the same id, so
	// each test still collapses in one query). Shards bound the aggregation's size: a 2017
	// chunk (885 M rows) in one query spilled 34 GB and still exceeded a 15 GB memory limit
	// while merging. 0 = one shard per ShardRows source rows.
	Shards                        int
	ShardRows                     uint64
	MaxThreads                    int
	MaxInsertThreads              int
	MaxMemoryUsage                uint64
	MaxBytesBeforeExternalGroupBy uint64
	// Convert months already in tests_conversion_log again.
	Redo bool
}

var DefaultConverterOptions = ConverterOptions{
	Strategy:                      StrategyJoin,
	ChunkMonths:                   12,
	ShardRows:                     250_000_000,
	MaxThreads:                    6,
	MaxInsertThreads:              1,
	MaxMemoryUsage:                20_000_000_000,
	MaxBytesBeforeExternalGroupBy: 6_000_000_000,
}

const (
	conversionLog     = "tests_conversion_log"
	conversionStaging = "tests_conv_staging"
	// StrategyJoin's lookup of a geospace's namespace and parent (a Join engine table read
	// with joinGet), and the ids it sends through the GROUP BY.
	conversionGeo        = "tests_conv_geo"
	conversionExceptions = "tests_conv_exceptions"
	// Memory of the classification GROUP BY per source row: measured 117-132 B on ClickHouse
	// 26.8 at 4-16 M ids of 37 bytes (two rows per id; the hash table grows in powers of two).
	classifyBytesPerRow = 125
)

func NewConverter(conn driver.Conn, opts ConverterOptions) *Converter {
	if opts.Strategy == "" {
		opts.Strategy = StrategyJoin
	}
	if opts.ChunkMonths < 1 {
		opts.ChunkMonths = 1
	}
	if opts.MaxInsertThreads < 1 {
		opts.MaxInsertThreads = 1
	}
	if opts.ClassifyShardRows == 0 {
		opts.ClassifyShardRows = opts.MaxMemoryUsage * 6 / 10 / classifyBytesPerRow
	}
	if opts.ClassifyShardRows < 1 {
		opts.ClassifyShardRows = 1
	}
	return &Converter{conn: conn, opts: opts}
}

func (c *Converter) ctx() context.Context {
	return c.ctxWith(nil)
}

// ctxWith is ctx with settings overridden.
func (c *Converter) ctxWith(override clickhouse.Settings) context.Context {
	settings := clickhouse.Settings{
		"max_threads":                        c.opts.MaxThreads,
		"max_insert_threads":                 c.opts.MaxInsertThreads,
		"max_memory_usage":                   c.opts.MaxMemoryUsage,
		"max_bytes_before_external_group_by": c.opts.MaxBytesBeforeExternalGroupBy,
		"async_insert":                       0,
	}
	for k, v := range override {
		settings[k] = v
	}
	return clickhouse.Context(context.Background(), clickhouse.WithSettings(settings))
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
	if c.opts.Strategy != StrategyJoin && c.opts.Strategy != StrategyGroupBy {
		return errors.New("converter#Convert: unknown strategy %q", c.opts.Strategy)
	}
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
// geospace columns take the smallest geospace of their namespace as a string (the ingestor's
// order; ClickHouse orders UUIDs differently); the test's other geospaces
// (a second county, a second tribal area, unknown namespaces) go to extra_geospace_ids.
// Duplicate (id, geospace) rows collapse into one.
func collapseQuery(filter string) string {
	return fmt.Sprintf(`
		SELECT c_time, c_id, c_test_style, c_ip, c_upload, c_mbps, c_min_rtt, c_loss_rate, c_latitude, c_longitude,
			c_location_accuracy_km, c_has_access_token, c_access_token_sig, c_asn_org_id, c_state_id, c_county_id, c_tribal_id,
			arraySort(x -> toString(x), arrayFilter(g -> g != ifNull(c_state_id, toUUID('00000000-0000-0000-0000-000000000000'))
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
				toUUIDOrNull(minIf(toString(m.geospace_id), m.geospace_id IN (SELECT id FROM geospaces WHERE namespace = 'states'))) AS c_state_id,
				toUUIDOrNull(minIf(toString(m.geospace_id), m.geospace_id IN (SELECT id FROM geospaces WHERE namespace = 'counties'))) AS c_county_id,
				toUUIDOrNull(minIf(toString(m.geospace_id), m.geospace_id IN (SELECT id FROM geospaces WHERE namespace = 'tribal_tracts'))) AS c_tribal_id,
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
	log.Printf("converter: reading %s..%s from measurements (%s)\n", first, last, c.opts.Strategy)
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
	var err error
	if c.opts.Strategy == StrategyGroupBy {
		err = c.collapseGroupBy(months, filter)
	} else {
		err = c.collapseJoin(months, filter)
	}
	if err != nil {
		return err
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

// collapseGroupBy (StrategyGroupBy) collapses the rows matching filter into the staging
// table with collapseQuery, in hash shards.
func (c *Converter) collapseGroupBy(months []month, filter string) error {
	start := time.Now()
	first, last := months[0], months[len(months)-1]
	shards, rows, err := c.shardsFor(filter)
	if err != nil {
		return err
	}
	log.Printf("converter: %s..%s: %d source rows in %d shard(s)\n", first, last, rows, shards)
	return c.collapseShards(filter, shards, func(k int) {
		log.Printf("converter: shard %d/%d of %s..%s done, %v elapsed\n", k+1, shards, first, last, time.Since(start))
	})
}

// collapseShards inserts collapseQuery(filter) into the staging table in shards hash shards.
func (c *Converter) collapseShards(filter string, shards int, done func(k int)) error {
	for k := 0; k < shards; k++ {
		shardFilter := filter
		if shards > 1 {
			shardFilter = fmt.Sprintf("%s AND cityHash64(m.id) %% %d = %d", filter, shards, k)
		}
		if err := c.exec(fmt.Sprintf("INSERT INTO %s (%s) %s", conversionStaging, testsColumns, collapseQuery(shardFilter))); err != nil {
			return errors.Wrap(err, "converter#collapseShards insert shard %d/%d", k+1, shards)
		}
		if shards > 1 {
			done(k)
		}
	}
	return nil
}

// collapseJoin (StrategyJoin) collapses the rows matching filter into the staging table.
//
// Exactness: collapseQuery's result for an id depends only on that id's rows, so collapsing
// a subset of the ids with it gives their rows of the full result. An id is taken from its
// county row instead only if its rows in the chunk are exactly one county row and one state
// row whose state is the county's parent_id in geospaces (then the test has no tribal or
// extra geospace, and its other columns are the same in both rows: the ingestor wrote them
// from one test, checked on production). The classification over all rows is exact: the
// GROUP BY key is the id itself, and count() = 2 AND sum(code) = 65537 holds only for one
// county row (code 1) and one state row (code 65536): the other codes are 0 (a geospace
// missing from geospaces) and 2^32 (other namespaces, counties without parent). sum(sv) = 0
// compares the state's id with the county's parent as 128-bit integers (state +id, county
// -parent_id), exact in wrapping arithmetic. Duplicate (id, geospace) rows have count() > 2
// and go through the GROUP BY, which collapses them.
func (c *Converter) collapseJoin(months []month, filter string) error {
	start := time.Now()
	first, last := months[0], months[len(months)-1]
	c.Stats = JoinStats{}
	for _, q := range []string{
		"DROP TABLE IF EXISTS " + conversionGeo,
		fmt.Sprintf("CREATE TABLE %s (id UUID, code UInt64, sv Int128, parent UUID) ENGINE = Join(ANY, LEFT, id)", conversionGeo),
		fmt.Sprintf(`INSERT INTO %s SELECT id,
			multiIf(namespace = 'states', 65536, namespace = 'counties' AND parent_id IS NOT NULL, 1, 4294967296) AS code,
			multiIf(namespace = 'states', toInt128(reinterpretAsUInt128(id)),
				namespace = 'counties', -toInt128(reinterpretAsUInt128(ifNull(parent_id, toUUID('00000000-0000-0000-0000-000000000000')))),
				toInt128(0)) AS sv,
			ifNull(parent_id, toUUID('00000000-0000-0000-0000-000000000000')) AS parent
			FROM geospaces`, conversionGeo),
		"DROP TABLE IF EXISTS " + conversionExceptions,
		fmt.Sprintf("CREATE TABLE %s (id String) ENGINE = MergeTree ORDER BY id", conversionExceptions),
	} {
		if err := c.exec(q); err != nil {
			return errors.Wrap(err, "converter#collapseJoin setup")
		}
	}
	defer c.exec("DROP TABLE IF EXISTS " + conversionExceptions)
	defer c.exec("DROP TABLE IF EXISTS " + conversionGeo)

	// Classify month by month (a month's rows are a fraction of the chunk's granules), in
	// hash shards small enough not to spill. Memory is bounded by the shard size; the spill
	// threshold is raised to a safety net.
	classifyCtx := c.ctxWith(clickhouse.Settings{"max_bytes_before_external_group_by": c.opts.MaxMemoryUsage * 9 / 10})
	for _, m := range months {
		monthFilter := fmt.Sprintf("m.time >= toDateTime('%s', 'UTC') AND m.time < toDateTime('%s', 'UTC')",
			m.start().Format("2006-01-02"), m.next().start().Format("2006-01-02"))
		var rows uint64
		if err := c.conn.QueryRow(c.ctx(), "SELECT count() FROM measurements m WHERE "+monthFilter).Scan(&rows); err != nil {
			return errors.Wrap(err, "converter#collapseJoin count")
		}
		c.Stats.SourceRows += rows
		shards := int((rows + c.opts.ClassifyShardRows - 1) / c.opts.ClassifyShardRows)
		if shards < 1 {
			shards = 1
		}
		for k := 0; k < shards; k++ {
			shardFilter := monthFilter
			if shards > 1 {
				shardFilter = fmt.Sprintf("%s AND cityHash64(m.id) %% %d = %d", monthFilter, shards, k)
			}
			if err := c.conn.Exec(classifyCtx, fmt.Sprintf(`INSERT INTO %s (id) SELECT m.id FROM measurements m WHERE %s GROUP BY m.id
				HAVING NOT (count() = 2 AND sum(joinGet('%s', 'code', m.geospace_id)) = 65537 AND sum(joinGet('%s', 'sv', m.geospace_id)) = 0)`,
				conversionExceptions, shardFilter, conversionGeo, conversionGeo)); err != nil {
				return errors.Wrap(err, "converter#collapseJoin classify %s shard %d/%d", m, k+1, shards)
			}
		}
		log.Printf("converter: classified %s: %d source rows in %d shard(s), %v elapsed\n", m, rows, shards, time.Since(start))
	}
	if err := c.conn.QueryRow(c.ctx(), "SELECT count() FROM "+conversionExceptions).Scan(&c.Stats.ExceptionIDs); err != nil {
		return errors.Wrap(err, "converter#collapseJoin count exceptions")
	}
	log.Printf("converter: %s..%s: %d source rows, %d ids go through the GROUP BY\n", first, last, c.Stats.SourceRows, c.Stats.ExceptionIDs)

	// The common tests, from their county row (a primary key range per upload value).
	if err := c.exec(fmt.Sprintf(`INSERT INTO %s (%s)
		SELECT m.time, m.id, m.test_style, toIPv6OrDefault(m.ip), m.upload, m.mbps, m.min_rtt, m.loss_rate, m.latitude, m.longitude,
			m.location_accuracy_km, m.has_access_token, m.access_token_sig, m.asn_org_id,
			joinGet('%s', 'parent', m.geospace_id), m.geospace_id, NULL, []
		FROM measurements m
		WHERE %s AND m.geospace_id IN (SELECT id FROM geospaces WHERE namespace = 'counties') AND m.id NOT IN (SELECT id FROM %s)`,
		conversionStaging, testsColumns, conversionGeo, filter, conversionExceptions)); err != nil {
		return errors.Wrap(err, "converter#collapseJoin county rows")
	}
	if err := c.conn.QueryRow(c.ctx(), "SELECT count() FROM "+conversionStaging).Scan(&c.Stats.FastTests); err != nil {
		return errors.Wrap(err, "converter#collapseJoin count staging")
	}
	log.Printf("converter: %s..%s: %d tests from their county row, %v elapsed\n", first, last, c.Stats.FastTests, time.Since(start))

	// The exceptions, with the GROUP BY; ~3 rows per id.
	shards := c.opts.Shards
	if shards < 1 {
		shards = int((c.Stats.ExceptionIDs*3 + c.opts.ShardRows - 1) / c.opts.ShardRows)
	}
	if shards < 1 {
		shards = 1
	}
	return c.collapseShards(fmt.Sprintf("%s AND m.id IN (SELECT id FROM %s)", filter, conversionExceptions), shards, func(k int) {
		log.Printf("converter: GROUP BY shard %d/%d of %s..%s done, %v elapsed\n", k+1, shards, first, last, time.Since(start))
	})
}

// shardsFor returns how many shards a chunk is collapsed in, and its source row count.
func (c *Converter) shardsFor(filter string) (int, uint64, error) {
	var rows uint64
	if err := c.conn.QueryRow(c.ctx(), "SELECT count() FROM measurements m WHERE "+filter).Scan(&rows); err != nil {
		return 0, 0, errors.Wrap(err, "converter#shardsFor count")
	}
	if c.opts.Shards > 0 {
		return c.opts.Shards, rows, nil
	}
	shards := int((rows + c.opts.ShardRows - 1) / c.opts.ShardRows)
	if shards < 1 {
		shards = 1
	}
	return shards, rows, nil
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
