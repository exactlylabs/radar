package clickhousestorages

import (
	"context"
	"fmt"
	"log"
	"math"
	"strings"
	"sync"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
)

// The map reads one summary table per window and variant: summary_<window> (per geospace
// and ASN org) and summary_geospace_<window> (per geospace). Each row is the median of the
// per-IP medians of the tests of one geospace in one time bucket.
//
// Tests are stored once (table tests, see migrations/004_tests.sql) with their geospaces in
// state_id, county_id, tribal_id and extra_geospace_ids. Summaries are computed as if each test
// were repeated once per geospace (the old measurements layout), so the numbers are those of
// the original materialized views.
//
// Per-IP medians are computed once per window, in the order of tests' sort key
// (upload, state_id, county_id, asn_org_id, ip, time): one streaming aggregation per
// (upload, state) shard, with the bucket as a monotonic function of time, so memory stays
// flat whatever the chunk size (a calendar year at a time). An IP whose tests of a bucket all
// share one (state, county, ASN) has, for its state and its county, with or without ASN, the
// median of the same tests, so those per-IP rows are derived from that single aggregation.
// The few IPs that span several states, counties or ASNs in a bucket (none in a whole year of
// 2019), and the tests with a tribal or extra geospace, are aggregated exactly per geospace
// from a small work table, as the views did. See docs/incremental-summaries.md.
//
// A summary row only depends on the tests of its own geospace and bucket, so after an ingest
// only the buckets containing the ingested dates are recomputed, into a staging table that is
// swapped in with REPLACE PARTITION. The all-time tables are rebuilt from ip_medians (per-IP
// all-time medians), which is updated only for the IPs of the ingested days.

type bucketColumn struct {
	name string
	typ  string
	// expr computes the column from a DateTime or Date column, given as %[1]s.
	// They must stay identical to the original view definitions so results don't change.
	expr string
}

type summaryWindow struct {
	name    string
	buckets []bucketColumn
	// keyExpr, a monotonic function of a DateTime column given as %[1]s, identifies the bucket
	// of a test within a calendar year, so GROUP BY keyExpr runs in the order of tests' sort key
	// (ClickHouse only matches a monotonic function of the next key column). The bucket columns
	// are then computed from min(time) of the group, which gives the same values as computing
	// them per test because every test of the group is in the same bucket.
	keyExpr string
}

var (
	yearColumn = bucketColumn{"year", "UInt16", "YEAR(%[1]s)"}

	summaryWindows = []summaryWindow{
		{"alltime", nil, ""},
		{"year", []bucketColumn{yearColumn}, "toYear(%[1]s)"},
		// The map sends semester 1 for Jan-Jun and 2 for Jul-Dec. The original views computed
		// (MONTH / 6) + 1, which put June in 2 and December in a semester 3 the map never asks for.
		{"semester", []bucketColumn{yearColumn, {"semester", "Int64", "intDiv(MONTH(%[1]s) - 1, 6) + 1"}}, "toStartOfInterval(%[1]s, INTERVAL 6 MONTH)"},
		{"quarter", []bucketColumn{yearColumn, {"quarter", "UInt8", "toQuarter(%[1]s)"}}, "toStartOfQuarter(%[1]s)"},
		{"month", []bucketColumn{yearColumn, {"month", "UInt8", "MONTH(%[1]s)"}}, "toYYYYMM(%[1]s)"},
		// WEEK() mode 0: weeks start on Sunday, and the days of the first and last week that fall
		// in the neighbouring year belong to that year's week 0 or 52/53. Within one calendar year
		// (chunks never cross one) a Sunday-started week is one bucket.
		{"week", []bucketColumn{yearColumn, {"week", "UInt8", "WEEK(%[1]s)"}}, "toStartOfWeek(%[1]s, 0)"},
	}
)

type summaryVariant struct {
	prefix  string
	withASN bool
	// ipMedians is the table of per-IP all-time medians this variant's all-time summary is built from.
	ipMedians string
}

var summaryVariants = []summaryVariant{
	{"summary_", true, "ip_medians"},
	{"summary_geospace_", false, "ip_medians_geospace"},
}

const usASNsTable = "us_asns"

// allGeospacesExpr is the array of every geospace of a test row t.
const allGeospacesExpr = `arrayConcat(
	if(t.state_id IS NULL, [], [assumeNotNull(t.state_id)]),
	if(t.county_id IS NULL, [], [assumeNotNull(t.county_id)]),
	if(t.tribal_id IS NULL, [], [assumeNotNull(t.tribal_id)]),
	t.extra_geospace_ids)`

// noASN is the asn_org_id of the per-geospace (no ASN) rows of the work tables.
const noASN = "toUUID('00000000-0000-0000-0000-000000000000')"

// SummaryTables lists every table the map reads, in rebuild order.
func SummaryTables() []string {
	names := []string{}
	for _, w := range summaryWindows {
		for _, v := range summaryVariants {
			names = append(names, v.prefix+w.name)
		}
	}
	return append(names, usASNsTable)
}

// rebuiltTables are the tables RebuildAll builds with the configured windows: every switched
// table without -windows; with -windows, the _next tables of the other windows are kept, so a
// rebuild can be resumed window by window.
func (s *Summarizer) rebuiltTables() []string {
	names := []string{}
	for _, w := range summaryWindows {
		if !s.wantsWindow(w.name) {
			continue
		}
		for _, v := range summaryVariants {
			names = append(names, v.prefix+w.name)
			if w.buckets == nil {
				names = append(names, v.ipMedians)
			}
		}
		if w.buckets == nil {
			names = append(names, usASNsTable)
		}
	}
	return names
}

// switchedTables are the tables built by RebuildAll and put live by SwitchOver.
func switchedTables() []string {
	names := SummaryTables()
	for _, v := range summaryVariants {
		names = append(names, v.ipMedians)
	}
	return names
}

type SummarizerOptions struct {
	// Only build these windows (alltime, year, semester, quarter, month, week); nil means all.
	Windows []string
	// Tests per shard query (whole states; a state bigger than this is still one shard), and
	// per-IP rows per outer aggregation query (shards of geospaces). Memory of the per-IP
	// aggregation doesn't depend on it (it streams in key order); it sets the query granularity
	// that Parallel spreads over the cores.
	ShardTargetRows uint64
	// max_threads of the queries that run alone. Shard queries that run side by side get
	// MaxThreads / Parallel each, at least 2.
	MaxThreads int
	// max_insert_threads of INSERT ... SELECT. ClickHouse 26.8 defaults it to the core count,
	// which multiplies memory, so it is always set.
	MaxInsertThreads int
	MaxMemoryUsage   uint64
	// Spill GROUP BY to disk past this many bytes, well below MaxMemoryUsage.
	MaxBytesBeforeExternalGroupBy uint64
	// Shard queries run at the same time (each is a streaming aggregation of under 1 GiB).
	Parallel int
}

var DefaultSummarizerOptions = SummarizerOptions{
	ShardTargetRows:               50_000_000,
	MaxThreads:                    8,
	MaxInsertThreads:              1,
	MaxMemoryUsage:                20_000_000_000,
	MaxBytesBeforeExternalGroupBy: 8_000_000_000,
	Parallel:                      4,
}

type Summarizer struct {
	conn driver.Conn
	opts SummarizerOptions
}

func NewSummarizer(conn driver.Conn, opts SummarizerOptions) *Summarizer {
	if opts.MaxInsertThreads <= 0 {
		opts.MaxInsertThreads = 1
	}
	if opts.Parallel < 1 {
		opts.Parallel = 1
	}
	if opts.MaxThreads < 1 {
		opts.MaxThreads = 1
	}
	if opts.ShardTargetRows < 1 {
		opts.ShardTargetRows = 1
	}
	return &Summarizer{conn: conn, opts: opts}
}

func (s *Summarizer) ctx() context.Context {
	return clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
		"max_threads":                        s.opts.MaxThreads,
		"max_insert_threads":                 s.opts.MaxInsertThreads,
		"max_memory_usage":                   s.opts.MaxMemoryUsage,
		"max_bytes_before_external_group_by": s.opts.MaxBytesBeforeExternalGroupBy,
		"async_insert":                       0,
	}))
}

func (s *Summarizer) exec(query string, args ...any) error {
	return s.conn.Exec(s.ctx(), query, args...)
}

// shardThreads is max_threads of the shard queries that run side by side.
func (s *Summarizer) shardThreads() int {
	n := s.opts.MaxThreads / s.opts.Parallel
	if n < 2 {
		n = 2
	}
	return n
}

// Update recomputes, in the live tables, every bucket that contains a day in [from, to], and
// the all-time tables for the IPs tested in [from, to].
func (s *Summarizer) Update(from, to time.Time) error {
	// Tables left by the old materialized views aren't partitioned, so REPLACE PARTITION
	// can't update them: they have to be rebuilt and switched over first.
	var unpartitioned uint64
	if err := s.conn.QueryRow(s.ctx(), `
		SELECT count() FROM system.tables
		WHERE database = currentDatabase() AND name IN (?) AND engine = 'MergeTree' AND partition_key = ''
		  AND name NOT LIKE '%alltime' AND name != ?`, SummaryTables(), usASNsTable).Scan(&unpartitioned); err != nil {
		return errors.Wrap(err, "summarizer#Update check partitioning")
	}
	if unpartitioned > 0 {
		return errors.New("summarizer#Update summary tables are not partitioned yet: run summarize -full and summarize -switch first")
	}
	if s.wantsWindow("alltime") {
		for _, v := range summaryVariants {
			ok, err := s.tableExists(v.ipMedians)
			if err != nil {
				return err
			}
			if !ok {
				return fmt.Errorf("summarizer#Update %s is missing: run summarize -full and summarize -switch first", v.ipMedians)
			}
		}
	}
	if err := s.ensureTables(""); err != nil {
		return err
	}
	return s.build("", from, to, false)
}

// RebuildAll computes every summary and ip_medians from all tests into <table>_next tables,
// leaving the live tables untouched. Use SwitchOver to put them live.
func (s *Summarizer) RebuildAll() error {
	from, to, err := s.dataRange()
	if err != nil {
		return err
	}
	if from == nil {
		return errors.New("summarizer#RebuildAll no tests")
	}
	for _, name := range s.rebuiltTables() {
		if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s_next`", name)); err != nil {
			return errors.Wrap(err, "summarizer#RebuildAll drop next")
		}
	}
	if err := s.ensureTables("_next"); err != nil {
		return err
	}
	return s.build("_next", *from, *to, true)
}

// SwitchOver drops the leftover *_tmp materialized views and tables of the old Summarize
// (some are still attached to measurements as insert triggers) and puts the <table>_next
// tables built by RebuildAll live. The replaced tables are kept as <table>_old.
func (s *Summarizer) SwitchOver() error {
	for _, name := range switchedTables() {
		exists, err := s.tableExists(name + "_next")
		if err != nil {
			return err
		}
		if !exists {
			return fmt.Errorf("summarizer#SwitchOver %s_next is missing, run a full rebuild first", name)
		}
	}
	for _, name := range append(SummaryTables(), "measurements") {
		if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s_tmp`", name)); err != nil {
			return errors.Wrap(err, "summarizer#SwitchOver drop tmp")
		}
	}
	for _, name := range switchedTables() {
		if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s_old`", name)); err != nil {
			return errors.Wrap(err, "summarizer#SwitchOver drop old")
		}
		exists, err := s.tableExists(name)
		if err != nil {
			return err
		}
		if exists {
			if err := s.exec(fmt.Sprintf("EXCHANGE TABLES `%[1]s_next` AND `%[1]s`", name)); err != nil {
				return errors.Wrap(err, "summarizer#SwitchOver exchange")
			}
			if err := s.exec(fmt.Sprintf("RENAME TABLE `%[1]s_next` TO `%[1]s_old`", name)); err != nil {
				return errors.Wrap(err, "summarizer#SwitchOver rename old")
			}
		} else if err := s.exec(fmt.Sprintf("RENAME TABLE `%[1]s_next` TO `%[1]s`", name)); err != nil {
			return errors.Wrap(err, "summarizer#SwitchOver rename next")
		}
		log.Printf("summarizer: %s is live\n", name)
	}
	return nil
}

func (s *Summarizer) build(suffix string, from, to time.Time, full bool) error {
	start := time.Now()
	for _, w := range summaryWindows {
		if !s.wantsWindow(w.name) {
			continue
		}
		if w.buckets == nil {
			if err := s.buildAllTime(suffix, from, to, full); err != nil {
				return err
			}
			continue
		}
		if err := s.buildWindow(w, suffix, from, to); err != nil {
			return errors.Wrap(err, "summarizer#build %s", w.name)
		}
	}
	log.Printf("summarizer: built %s to %s in %v\n", from.Format("2006-01-02"), to.Format("2006-01-02"), time.Since(start))
	return nil
}

func (s *Summarizer) wantsWindow(name string) bool {
	if len(s.opts.Windows) == 0 {
		return true
	}
	for _, w := range s.opts.Windows {
		if w == name {
			return true
		}
	}
	return false
}

type bucket struct {
	values   []string // literal values of the bucket columns
	firstDay string
	lastDay  string
}

func (b bucket) partition() string {
	if len(b.values) == 1 {
		return b.values[0]
	}
	return "(" + strings.Join(b.values, ", ") + ")"
}

// buckets returns the buckets of w that contain a day in [from, to], with their full date span.
// They're computed by ClickHouse from the same expressions as the summaries, so week
// numbering and year boundaries can't drift from what the tables contain.
func (s *Summarizer) buckets(w summaryWindow, from, to time.Time) ([]bucket, error) {
	// No bucket spans more than a year, so a 400 day margin covers the whole of the first and last bucket.
	cols := make([]string, len(w.buckets))
	for i, c := range w.buckets {
		cols[i] = fmt.Sprintf("toString(%s) AS %s", fmt.Sprintf(c.expr, "d"), c.name)
	}
	names := make([]string, len(w.buckets))
	for i, c := range w.buckets {
		names[i] = c.name
	}
	query := fmt.Sprintf(`
		SELECT %[1]s, toString(min(d)), toString(max(d))
		FROM (SELECT toDate(?) - 400 + number AS d FROM numbers(toUInt64(dateDiff('day', toDate(?), toDate(?)) + 801)))
		GROUP BY %[2]s
		HAVING countIf(d BETWEEN toDate(?) AND toDate(?)) > 0
		ORDER BY min(d)`,
		strings.Join(cols, ", "), strings.Join(names, ", "))
	f, t := from.UTC().Format("2006-01-02"), to.UTC().Format("2006-01-02")
	rows, err := s.conn.Query(s.ctx(), query, f, f, t, f, t)
	if err != nil {
		return nil, errors.Wrap(err, "summarizer#buckets Query")
	}
	defer rows.Close()
	result := []bucket{}
	for rows.Next() {
		vals := make([]string, len(w.buckets))
		dest := []any{}
		for i := range vals {
			dest = append(dest, &vals[i])
		}
		var b bucket
		dest = append(dest, &b.firstDay, &b.lastDay)
		if err := rows.Scan(dest...); err != nil {
			return nil, errors.Wrap(err, "summarizer#buckets Scan")
		}
		b.values = vals
		result = append(result, b)
	}
	return result, rows.Err()
}

// chunk is the span of tests computed by one pass: whole buckets of one calendar year.
type chunk struct {
	firstDay, lastDay string
	buckets           []bucket
}

// filter selects the chunk's tests of table alias t. The time range prunes tests' monthly
// partitions.
func (c chunk) filter() string {
	return fmt.Sprintf("t.time >= toDateTime('%s', 'UTC') AND t.time < toDateTime('%s', 'UTC') + INTERVAL 1 DAY", c.firstDay, c.lastDay)
}

// chunksByYear groups buckets (ordered by first day) by the calendar year they're in.
func chunksByYear(buckets []bucket) []chunk {
	chunks := []chunk{}
	for _, b := range buckets {
		if n := len(chunks); n > 0 && chunks[n-1].firstDay[:4] == b.firstDay[:4] {
			chunks[n-1].lastDay = b.lastDay
			chunks[n-1].buckets = append(chunks[n-1].buckets, b)
			continue
		}
		chunks = append(chunks, chunk{b.firstDay, b.lastDay, []bucket{b}})
	}
	return chunks
}

// buildWindow computes the buckets of w containing a day in [from, to], chunk by chunk, into
// staging tables that replace the buckets' partitions of the window's two tables.
func (s *Summarizer) buildWindow(w summaryWindow, suffix string, from, to time.Time) error {
	buckets, err := s.buckets(w, from, to)
	if err != nil {
		return err
	}
	staging := map[string]string{} // variant prefix -> staging table
	for _, v := range summaryVariants {
		table := v.prefix + w.name + suffix + "_staging"
		if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", table)); err != nil {
			return errors.Wrap(err, "summarizer#buildWindow drop staging")
		}
		if err := s.createSummaryTable(table, w, v); err != nil {
			return err
		}
		defer s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", table))
		staging[v.prefix] = table
	}
	work := newWorkTables(w, suffix)
	defer work.drop(s)
	for _, c := range chunksByYear(buckets) {
		start := time.Now()
		if err := s.computeChunk(w, work, c); err != nil {
			return err
		}
		for _, v := range summaryVariants {
			if err := s.outer(w, v, work, staging[v.prefix]); err != nil {
				return err
			}
		}
		for _, b := range c.buckets {
			for _, v := range summaryVariants {
				if err := s.replacePartition(v.prefix+w.name+suffix, b.partition(), staging[v.prefix]); err != nil {
					return err
				}
			}
		}
		for _, table := range staging {
			if err := s.exec(fmt.Sprintf("TRUNCATE TABLE `%s`", table)); err != nil {
				return errors.Wrap(err, "summarizer#buildWindow truncate")
			}
		}
		log.Printf("summarizer: %s %s..%s (%d buckets) in %v\n", w.name, c.firstDay, c.lastDay, len(c.buckets), time.Since(start))
	}
	return nil
}

// replacePartition puts staging's partition in table, or drops it from table when staging has
// none (from ClickHouse 26.6 REPLACE PARTITION refuses an empty source; before, it emptied the
// destination, which is what we want).
func (s *Summarizer) replacePartition(table, partition, staging string) error {
	return replacePartition(s.ctx(), s.conn, table, partition, staging)
}

func replacePartition(ctx context.Context, conn driver.Conn, table, partition, staging string) error {
	// Rows of that partition in staging, via the _partition_id virtual column (the pipeline's
	// database user can't read system.parts).
	var parts uint64
	if err := conn.QueryRow(ctx, fmt.Sprintf(
		"SELECT count() FROM `%s` WHERE _partition_id = partitionId(%s)",
		staging, strings.Trim(partition, "()"))).Scan(&parts); err != nil {
		return errors.Wrap(err, "replacePartition count rows")
	}
	if parts == 0 {
		return wrap(conn.Exec(ctx, fmt.Sprintf("ALTER TABLE `%s` DROP PARTITION %s", table, partition)), "replacePartition drop %s %s", table, partition)
	}
	return wrap(conn.Exec(ctx, fmt.Sprintf("ALTER TABLE `%s` REPLACE PARTITION %s FROM `%s`", table, partition, staging)), "replacePartition %s %s", table, partition)
}

// --- per-IP medians of a chunk ---

// workTables hold the per-IP medians of one chunk of a window:
//   - fine: one row per (upload, state, county, ASN, IP, bucket), the per-IP medians over
//     those tests, from the streaming aggregation of tests in key order;
//   - splits: the (upload, IP, bucket) with more than one fine row, whose state and county
//     rows must be recomputed per geospace;
//   - tests: the tests of the split IPs and every test with a tribal or extra geospace;
//   - geo: per-IP medians per geospace of the tests in `tests` (state and county of the split
//     IPs, tribal and extra geospaces of every IP), for each variant.
//
// The fine rows of the IPs not in splits, for their state and county, plus the geo rows, are
// exactly the per-IP rows of the original views.
type workTables struct {
	w                         summaryWindow
	fine, splits, tests, geo  string
	bucketNames               string // ", year, week" (with a leading comma) or ""
	bucketDefs                string // ", year UInt16, week UInt8" or ""
	bucketKey                 string // the window's bucket columns of the work tables' keys
	bucketExprsOfTime         string // ", YEAR(t.time), WEEK(t.time)" or ""
	bucketSelectOfMinTime     string // ", YEAR(min(t.time)) AS year, ..." or ""
	bucketSelectOfTimeAliased string // ", YEAR(time) AS year, ..." or ""
}

func newWorkTables(w summaryWindow, suffix string) *workTables {
	prefix := "summary_work_" + w.name + suffix
	wt := &workTables{w: w, fine: prefix + "_fine", splits: prefix + "_splits", tests: prefix + "_tests", geo: prefix + "_geo"}
	names, defs, ofTime, ofMin, aliased := []string{}, []string{}, []string{}, []string{}, []string{}
	for _, c := range w.buckets {
		names = append(names, c.name)
		defs = append(defs, c.name+" "+c.typ)
		ofTime = append(ofTime, fmt.Sprintf(c.expr, "t.time"))
		ofMin = append(ofMin, fmt.Sprintf(c.expr, "min(t.time)")+" AS "+c.name)
		aliased = append(aliased, fmt.Sprintf(c.expr, "time")+" AS "+c.name)
	}
	if len(w.buckets) > 0 {
		wt.bucketNames = ", " + strings.Join(names, ", ")
		wt.bucketDefs = ", " + strings.Join(defs, ", ")
		wt.bucketKey = ", " + strings.Join(names, ", ")
		wt.bucketExprsOfTime = ", " + strings.Join(ofTime, ", ")
		wt.bucketSelectOfMinTime = ", " + strings.Join(ofMin, ", ")
		wt.bucketSelectOfTimeAliased = ", " + strings.Join(aliased, ", ")
	}
	return wt
}

func (wt *workTables) all() []string {
	return []string{wt.fine, wt.splits, wt.tests, wt.geo}
}

func (wt *workTables) drop(s *Summarizer) {
	for _, t := range wt.all() {
		s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", t))
	}
}

func (wt *workTables) create(s *Summarizer) error {
	wt.drop(s)
	for _, q := range []string{
		fmt.Sprintf("CREATE TABLE `%s` (upload Bool, state_id Nullable(UUID), county_id Nullable(UUID), asn_org_id UUID, ip IPv6%s, med_mbps Float64, med_min_rtt Float64, samples UInt64) ENGINE = MergeTree ORDER BY (upload, ip%s)",
			wt.fine, wt.bucketDefs, wt.bucketKey),
		fmt.Sprintf("CREATE TABLE `%s` (upload Bool, ip IPv6%s) ENGINE = MergeTree ORDER BY (upload, ip%s)", wt.splits, wt.bucketDefs, wt.bucketKey),
		fmt.Sprintf("CREATE TABLE `%s` (variant UInt8, upload Bool, geospace_id UUID, asn_org_id UUID, ip IPv6%s, med_mbps Float64, med_min_rtt Float64, samples UInt64) ENGINE = MergeTree ORDER BY (variant, upload, geospace_id, asn_org_id, ip%s)",
			wt.geo, wt.bucketDefs, wt.bucketKey),
	} {
		if err := s.exec(q); err != nil {
			return errors.Wrap(err, "summarizer#workTables create")
		}
	}
	return nil
}

// splitsTuple is the tuple that identifies an IP's rows of a bucket, with the bucket computed
// from table alias t's time.
func (wt *workTables) splitsTupleOfTests() string {
	return fmt.Sprintf("(t.upload, t.ip%s)", wt.bucketExprsOfTime)
}

func (wt *workTables) splitsSelect() string {
	return fmt.Sprintf("SELECT upload, ip%s FROM `%s`", wt.bucketNames, wt.splits)
}

// computeChunk fills the work tables with the per-IP medians of the chunk.
func (s *Summarizer) computeChunk(w summaryWindow, work *workTables, c chunk) error {
	if err := work.create(s); err != nil {
		return err
	}
	start := time.Now()
	shards, err := s.stateShards(c.filter())
	if err != nil {
		return err
	}
	queries := make([]string, len(shards))
	for i, sh := range shards {
		queries[i] = s.fineInsert(w, work, c.filter()+" AND "+sh)
	}
	if err := s.runConcurrently(queries); err != nil {
		return errors.Wrap(err, "summarizer#computeChunk fine")
	}
	fineRows, err := s.count(work.fine)
	if err != nil {
		return err
	}
	log.Printf("summarizer: %s %s..%s: %d per-IP rows in %d shards, %v\n", w.name, c.firstDay, c.lastDay, fineRows, len(shards), time.Since(start))

	// IPs with several (state, county, ASN) in a bucket. fine is ordered by (upload, ip, bucket),
	// so this streams too.
	if err := s.exec(fmt.Sprintf(`
		INSERT INTO `+"`%[1]s`"+` (upload, ip%[2]s)
		SELECT upload, ip%[2]s FROM `+"`%[3]s`"+`
		GROUP BY upload, ip%[2]s HAVING count() > 1
		SETTINGS %[4]s`, work.splits, work.bucketNames, work.fine, inOrderSettings)); err != nil {
		return errors.Wrap(err, "summarizer#computeChunk splits")
	}
	splits, err := s.count(work.splits)
	if err != nil {
		return err
	}

	// One scan of the chunk for the tests that are aggregated per geospace: those of the split
	// IPs, and those with a tribal or extra geospace.
	if err := s.exec(fmt.Sprintf(`
		CREATE TABLE `+"`%s`"+` ENGINE = MergeTree ORDER BY (upload, ip) AS
		SELECT t.time AS time, t.ip AS ip, t.upload AS upload, t.mbps AS mbps, t.min_rtt AS min_rtt, t.asn_org_id AS asn_org_id,
			t.state_id AS state_id, t.county_id AS county_id, t.tribal_id AS tribal_id, t.extra_geospace_ids AS extra_geospace_ids,
			%s IN (%s) AS split
		FROM tests t
		WHERE %s AND (split OR t.tribal_id IS NOT NULL OR notEmpty(t.extra_geospace_ids))`,
		work.tests, work.splitsTupleOfTests(), work.splitsSelect(), c.filter())); err != nil {
		return errors.Wrap(err, "summarizer#computeChunk tests")
	}
	geoTests, err := s.count(work.tests)
	if err != nil {
		return err
	}
	// Per geospace: one streaming aggregation per variant over the work table in its (upload, ip)
	// order, each test expanded to the geospaces of this path (state and county of the split IPs,
	// tribal and extra geospaces of every test). ARRAY JOIN keeps the read order, so the
	// aggregation holds the few (geospace, ASN) keys of one IP at a time. Hash shards of IPs did
	// this before: every shard re-read the whole table four times, 100 scans of 1.2 B rows (a
	// quarter of all tests take this path over all time) in production.
	geoExpr := `arrayConcat(
				if(t.split AND t.state_id IS NOT NULL, [assumeNotNull(t.state_id)], []),
				if(t.split AND t.county_id IS NOT NULL, [assumeNotNull(t.county_id)], []),
				if(t.tribal_id IS NOT NULL, [assumeNotNull(t.tribal_id)], []),
				t.extra_geospace_ids)`
	threads := s.opts.MaxThreads / len(summaryVariants)
	if threads < 2 {
		threads = 2
	}
	geoQueries := make([]string, 0, len(summaryVariants))
	for _, v := range summaryVariants {
		variant, asn, group := 1, "t.asn_org_id", "t.upload, geospace_id, t.asn_org_id, t.ip"
		if !v.withASN {
			variant, asn, group = 0, noASN, "t.upload, geospace_id, t.ip"
		}
		geoQueries = append(geoQueries, fmt.Sprintf(`
			INSERT INTO `+"`%s`"+` (variant, upload, geospace_id, asn_org_id, ip%s, med_mbps, med_min_rtt, samples)
			SELECT %d, t.upload, geospace_id, %s, t.ip%s, quantileExact(0.5)(t.mbps), quantileExact(0.5)(t.min_rtt), count()
			FROM `+"`%s`"+` t
			ARRAY JOIN %s AS geospace_id
			GROUP BY %s%s
			SETTINGS %s, max_threads = %d`,
			work.geo, work.bucketNames, variant, asn, work.bucketSelectOfTimeAliased, work.tests, geoExpr, group, work.bucketNames, inOrderSettings, threads))
	}
	if err := s.runConcurrently(geoQueries); err != nil {
		return errors.Wrap(err, "summarizer#computeChunk geo")
	}
	log.Printf("summarizer: %s %s..%s: %d split IP buckets, %d tests aggregated per geospace, %v\n",
		w.name, c.firstDay, c.lastDay, splits, geoTests, time.Since(start))
	return nil
}

// inOrderSettings run a GROUP BY on a prefix of the table's sort key as a streaming
// aggregation. Memory then comes from the parts being read at the same time: without the
// preliminary merge (which ClickHouse only adds from 100 parts) every part of the range is its
// own aggregating stream with its own result block (50 MB by default) and read buffers, 9 MB
// per part with max_block_size 8192 (measured: a 84-part range took 1.21 GiB, 180 MiB with
// these settings; the whole 2019 of production, 81 parts, 4.77 GiB -> see below), and the
// all-time chunk reads every part of the table.
const inOrderSettings = "optimize_aggregation_in_order = 1, read_in_order_two_level_merge_threshold = 0, max_block_size = 8192, aggregation_in_order_max_block_bytes = 4000000"

// fineInsert aggregates the tests matching filter per (upload, state, county, ASN, IP, bucket)
// in the order of the table's sort key: memory holds a few groups at a time whatever the span.
func (s *Summarizer) fineInsert(w summaryWindow, work *workTables, filter string) string {
	key := ""
	if w.keyExpr != "" {
		key = ", " + fmt.Sprintf(w.keyExpr, "t.time")
	}
	return fmt.Sprintf(`
		INSERT INTO `+"`%s`"+` (upload, state_id, county_id, asn_org_id, ip%s, med_mbps, med_min_rtt, samples)
		SELECT t.upload, t.state_id, t.county_id, t.asn_org_id, t.ip%s, quantileExact(0.5)(t.mbps), quantileExact(0.5)(t.min_rtt), count()
		FROM tests t
		WHERE %s
		GROUP BY t.upload, t.state_id, t.county_id, t.asn_org_id, t.ip%s
		SETTINGS %s, max_threads = %d`,
		work.fine, work.bucketNames, work.bucketSelectOfMinTime, filter, key, inOrderSettings, s.shardThreads())
}

// stateShards splits the tests matching filter into shards of about ShardTargetRows tests, as
// filters on table alias t that the sort key prunes: whole (upload, state) groups packed
// together, and the states bigger than that split into groups of whole counties. A streaming
// aggregation keeps its arena until the query ends, so its memory is about 25 bytes per test
// of the shard (4.8 GiB for the 216 M tests of 2019 in one query), which this bounds.
func (s *Summarizer) stateShards(filter string) ([]string, error) {
	rows, err := s.conn.Query(s.ctx(), fmt.Sprintf(`
		SELECT t.upload, toString(t.state_id), toString(t.county_id), count()
		FROM tests t WHERE %s
		GROUP BY t.upload, t.state_id, t.county_id ORDER BY t.upload, t.state_id, t.county_id`, filter))
	if err != nil {
		return nil, errors.Wrap(err, "summarizer#stateShards Query")
	}
	defer rows.Close()
	type county struct {
		id   *string
		rows uint64
	}
	type state struct {
		upload   bool
		id       *string
		counties []county
		rows     uint64
	}
	states := []state{}
	for rows.Next() {
		var upload bool
		var st, co *string
		var n uint64
		if err := rows.Scan(&upload, &st, &co, &n); err != nil {
			return nil, errors.Wrap(err, "summarizer#stateShards Scan")
		}
		if k := len(states); k == 0 || states[k-1].upload != upload || !sameID(states[k-1].id, st) {
			states = append(states, state{upload: upload, id: st})
		}
		cur := &states[len(states)-1]
		cur.counties = append(cur.counties, county{co, n})
		cur.rows += n
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	result := []string{}
	var packed []string // whole states of one upload, under ShardTargetRows together
	var packedUpload bool
	var packedRows uint64
	flush := func() {
		if len(packed) > 0 {
			result = append(result, fmt.Sprintf("t.upload = %t AND t.state_id IN ('%s')", packedUpload, strings.Join(packed, "', '")))
		}
		packed, packedRows = nil, 0
	}
	for _, st := range states {
		switch {
		case st.id == nil:
			result = append(result, fmt.Sprintf("t.upload = %t AND t.state_id IS NULL", st.upload))
		case st.rows > s.opts.ShardTargetRows:
			// Shards of whole counties; a county over the target is a shard on its own.
			var counties []string
			var n uint64
			flushCounties := func() {
				if len(counties) > 0 {
					result = append(result, fmt.Sprintf("t.upload = %t AND t.state_id = '%s' AND t.county_id IN ('%s')", st.upload, *st.id, strings.Join(counties, "', '")))
				}
				counties, n = nil, 0
			}
			for _, c := range st.counties {
				if c.id == nil {
					result = append(result, fmt.Sprintf("t.upload = %t AND t.state_id = '%s' AND t.county_id IS NULL", st.upload, *st.id))
					continue
				}
				if len(counties) > 0 && n+c.rows > s.opts.ShardTargetRows {
					flushCounties()
				}
				counties = append(counties, *c.id)
				n += c.rows
			}
			flushCounties()
		default:
			if len(packed) > 0 && (packedUpload != st.upload || packedRows+st.rows > s.opts.ShardTargetRows) {
				flush()
			}
			packedUpload = st.upload
			packed = append(packed, *st.id)
			packedRows += st.rows
		}
	}
	flush()
	return result, nil
}

func sameID(a, b *string) bool {
	if a == nil || b == nil {
		return a == b
	}
	return *a == *b
}

// runConcurrently executes queries with Parallel workers.
func (s *Summarizer) runConcurrently(queries []string) error {
	sem := make(chan struct{}, s.opts.Parallel)
	errs := make(chan error, len(queries))
	var wg sync.WaitGroup
	for _, q := range queries {
		wg.Add(1)
		sem <- struct{}{}
		go func(q string) {
			defer wg.Done()
			defer func() { <-sem }()
			if err := s.exec(q); err != nil {
				errs <- err
			}
		}(q)
	}
	wg.Wait()
	close(errs)
	return <-errs
}

func (s *Summarizer) count(table string) (uint64, error) {
	var n uint64
	err := s.conn.QueryRow(s.ctx(), fmt.Sprintf("SELECT count() FROM `%s`", table)).Scan(&n)
	return n, wrap(err, "summarizer#count %s", table)
}

// perIPRows is a subquery with the per-IP rows of variant v (geospace_id, asn_org_id, upload,
// ip, bucket columns, med_mbps, med_min_rtt, samples) of the chunk in the work tables: the
// state and county of the fine rows of the IPs that aren't split, and the geo rows. filter
// applies to every part, on geospace_id and upload.
func perIPRows(v summaryVariant, work *workTables, filter string) string {
	variant := 1
	if !v.withASN {
		variant = 0
	}
	parts := []string{}
	for _, col := range []string{"state_id", "county_id"} {
		parts = append(parts, fmt.Sprintf(`
			SELECT geospace_id, asn_org_id, upload, ip%s, med_mbps, med_min_rtt, samples
			FROM (SELECT assumeNotNull(%s) AS geospace_id, asn_org_id, upload, ip%s, med_mbps, med_min_rtt, samples FROM `+"`%s`"+`
			      WHERE %s IS NOT NULL AND (upload, ip%s) NOT IN (%s))
			WHERE %s`, work.bucketNames, col, work.bucketNames, work.fine, col, work.bucketNames, work.splitsSelect(), filter))
	}
	parts = append(parts, fmt.Sprintf(`
			SELECT geospace_id, asn_org_id, upload, ip%s, med_mbps, med_min_rtt, samples FROM `+"`%s`"+`
			WHERE variant = %d AND %s`, work.bucketNames, work.geo, variant, filter))
	return "(" + strings.Join(parts, " UNION ALL ") + ")"
}

// outer inserts the summaries of variant v of the chunk in the work tables into staging, in
// shards of geospaces sized from the per-IP row count (a shard holds its per-IP medians in
// memory: ShardTargetRows x 16 bytes plus the hash table), Parallel at a time.
func (s *Summarizer) outer(w summaryWindow, v summaryVariant, work *workTables, staging string) error {
	fineRows, err := s.count(work.fine)
	if err != nil {
		return err
	}
	geoRows, err := s.count(work.geo)
	if err != nil {
		return err
	}
	n := int(math.Ceil(float64(2*fineRows+geoRows) / float64(s.opts.ShardTargetRows)))
	if n < 1 {
		n = 1
	}
	keys := []string{"geospace_id"}
	if v.withASN {
		keys = append(keys, "asn_org_id")
	}
	keys = append(keys, "upload")
	for _, c := range w.buckets {
		keys = append(keys, c.name)
	}
	queries := []string{}
	for _, upload := range []bool{false, true} {
		for i := 0; i < n; i++ {
			filter := fmt.Sprintf("upload = %t AND cityHash64(geospace_id) %% %d = %d", upload, n, i)
			queries = append(queries, fmt.Sprintf(`
				INSERT INTO `+"`%s`"+` (med_mbps, med_min_rtt, bad_count, normal_count, good_count, total_samples, %s)
				SELECT %s
				FROM (SELECT geospace_id, asn_org_id, upload%s, med_mbps AS med_ip_mbps, med_min_rtt AS med_ip_rtt FROM %s) m_ip
				GROUP BY %s
				SETTINGS max_threads = %d`,
				staging, strings.Join(keys, ", "), outerSummaryColumns(keys), work.bucketNames,
				perIPRows(v, work, filter), strings.Join(keys, ", "), s.shardThreads()))
		}
	}
	return wrap(s.runConcurrently(queries), "summarizer#outer insert")
}

func summaryKeys(w summaryWindow, v summaryVariant) []string {
	keys := []string{"geospace_id"}
	if v.withASN {
		keys = append(keys, "asn_org_id")
	}
	keys = append(keys, "upload")
	for _, c := range w.buckets {
		keys = append(keys, c.name)
	}
	return keys
}

func (s *Summarizer) createSummaryTable(name string, w summaryWindow, v summaryVariant) error {
	cols := []string{
		"med_mbps Float64", "med_min_rtt Float64", "bad_count UInt64", "normal_count UInt64",
		"good_count UInt64", "total_samples UInt64", "geospace_id UUID",
	}
	// The map always reads summary_<window> for one ASN org, so it leads the sort key.
	order := []string{"upload", "geospace_id"}
	if v.withASN {
		cols = append(cols, "asn_org_id UUID")
		order = []string{"asn_org_id", "upload", "geospace_id"}
	}
	cols = append(cols, "upload Bool")
	partition := []string{}
	for _, c := range w.buckets {
		cols = append(cols, c.name+" "+c.typ)
		order = append(order, c.name)
		partition = append(partition, c.name)
	}
	query := fmt.Sprintf("CREATE TABLE IF NOT EXISTS `%s` (%s) ENGINE = MergeTree", name, strings.Join(cols, ", "))
	if len(partition) > 0 {
		query += fmt.Sprintf(" PARTITION BY (%s)", strings.Join(partition, ", "))
	}
	query += fmt.Sprintf(" ORDER BY (%s)", strings.Join(order, ", "))
	return wrap(s.exec(query), "summarizer#createSummaryTable")
}

// outerSummaryColumns is the outer SELECT of the original views, over per-IP medians
// med_ip_mbps and med_ip_rtt, followed by the key columns.
func outerSummaryColumns(keys []string) string {
	return `
			quantileExact(0.5)(m_ip.med_ip_mbps) AS med_mbps,
			quantileExact(0.5)(m_ip.med_ip_rtt) AS med_min_rtt,
			CountIf(med_ip_mbps < if(upload=0, 25, 3)) AS bad_count,
			CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) AS normal_count,
			CountIf(med_ip_mbps > if(upload=0, 100, 20)) AS good_count,
			Count(*) AS total_samples,
			` + strings.Join(keys, ", ")
}

// --- all-time ---

func (s *Summarizer) createIPMediansTable(name string, v summaryVariant) error {
	cols := "upload Bool, geospace_id UUID, "
	order := "upload, geospace_id, "
	if v.withASN {
		cols += "asn_org_id UUID, "
		order += "asn_org_id, "
	}
	cols += "ip IPv6, med_mbps Float64, med_min_rtt Float64, samples UInt64, version UInt64"
	order += "ip"
	return wrap(s.exec(fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS `%s` (%s) ENGINE = ReplacingMergeTree(version) ORDER BY (%s)", name, cols, order)),
		"summarizer#createIPMediansTable")
}

// ipMediansInsert inserts the per-IP medians of the (test, geospace) rows of source into table.
func ipMediansInsert(table string, v summaryVariant, source string, version int64) string {
	keys := "upload, geospace_id, "
	if v.withASN {
		keys += "asn_org_id, "
	}
	keys += "ip"
	return fmt.Sprintf(`
		INSERT INTO `+"`%s`"+` (%[2]s, med_mbps, med_min_rtt, samples, version)
		SELECT %[2]s, quantileExact(0.5)(mbps), quantileExact(0.5)(min_rtt), count(), %[3]d
		FROM %[4]s
		GROUP BY %[2]s`, table, keys, version, source)
}

func (s *Summarizer) buildAllTime(suffix string, from, to time.Time, full bool) error {
	start := time.Now()
	var err error
	if full {
		err = s.rebuildIPMedians(suffix, from, to)
	} else {
		err = s.updateIPMedians(suffix, from, to)
	}
	if err != nil {
		return err
	}
	log.Printf("summarizer: ip medians in %v\n", time.Since(start))
	w := summaryWindows[0]
	for _, v := range summaryVariants {
		if err := s.allTimeFromIPMedians(v.prefix+w.name+suffix, w, v, v.ipMedians+suffix); err != nil {
			return err
		}
	}
	// us_asns is derived from summary_alltime.
	return s.buildUSASNs(suffix)
}

// rebuildIPMedians computes the per-IP all-time medians of every geospace from all tests, as
// one chunk of the all-time window (no bucket).
func (s *Summarizer) rebuildIPMedians(suffix string, from, to time.Time) error {
	version := time.Now().UnixNano()
	for _, v := range summaryVariants {
		if err := s.exec(fmt.Sprintf("TRUNCATE TABLE `%s%s`", v.ipMedians, suffix)); err != nil {
			return errors.Wrap(err, "summarizer#rebuildIPMedians truncate")
		}
	}
	w := summaryWindows[0]
	work := newWorkTables(w, suffix)
	defer work.drop(s)
	c := chunk{firstDay: from.UTC().Format("2006-01-02"), lastDay: to.UTC().Format("2006-01-02")}
	if err := s.computeChunk(w, work, c); err != nil {
		return err
	}
	for _, v := range summaryVariants {
		keys := "upload, geospace_id, "
		if v.withASN {
			keys += "asn_org_id, "
		}
		keys += "ip"
		if err := s.exec(fmt.Sprintf(`
			INSERT INTO `+"`%s%s`"+` (%[3]s, med_mbps, med_min_rtt, samples, version)
			SELECT %[3]s, med_mbps, med_min_rtt, samples, %[4]d FROM %[5]s`,
			v.ipMedians, suffix, keys, version, perIPRows(v, work, "1"))); err != nil {
			return errors.Wrap(err, "summarizer#rebuildIPMedians insert")
		}
	}
	return nil
}

// updateIPMedians recomputes the per-IP all-time medians of every (geospace, ASN, IP) of the IPs
// tested in [from, to]. Their whole history is copied once into a work table (one scan of
// tests' upload and ip columns), then aggregated in shards of IP hashes, which bound memory and
// stay exact because every key has a single IP. The new rows replace the old ones in the
// ReplacingMergeTree (read with FINAL).
func (s *Summarizer) updateIPMedians(suffix string, from, to time.Time) error {
	version := time.Now().UnixNano()
	ips := "ip_medians_ips" + suffix
	work := "ip_medians_rows" + suffix
	for _, t := range []string{ips, work} {
		if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", t)); err != nil {
			return errors.Wrap(err, "summarizer#updateIPMedians drop")
		}
		defer s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", t))
	}
	if err := s.exec(fmt.Sprintf(`
		CREATE TABLE `+"`%s`"+` ENGINE = MergeTree ORDER BY (upload, ip) AS
		SELECT DISTINCT t.upload AS upload, t.ip AS ip FROM tests t
		WHERE t.time >= toDateTime('%s', 'UTC') AND t.time < toDateTime('%s', 'UTC') + INTERVAL 1 DAY`,
		ips, from.UTC().Format("2006-01-02"), to.UTC().Format("2006-01-02"))); err != nil {
		return errors.Wrap(err, "summarizer#updateIPMedians ips")
	}
	if err := s.exec(fmt.Sprintf(`
		CREATE TABLE `+"`%s`"+` ENGINE = MergeTree ORDER BY (upload, ip) AS
		SELECT t.upload AS upload, t.ip AS ip, t.asn_org_id AS asn_org_id, t.mbps AS mbps, t.min_rtt AS min_rtt,
			%s AS geospace_ids
		FROM tests t
		WHERE (t.upload, t.ip) IN (SELECT upload, ip FROM `+"`%s`"+`)`, work, allGeospacesExpr, ips)); err != nil {
		return errors.Wrap(err, "summarizer#updateIPMedians rows")
	}
	var rows uint64
	if err := s.conn.QueryRow(s.ctx(), fmt.Sprintf("SELECT sum(length(geospace_ids)) FROM `%s`", work)).Scan(&rows); err != nil {
		return errors.Wrap(err, "summarizer#updateIPMedians count")
	}
	n := int(math.Ceil(float64(rows) / float64(s.opts.ShardTargetRows)))
	if n < 1 {
		n = 1
	}
	for i := 0; i < n; i++ {
		source := fmt.Sprintf(`(
			SELECT geospace_id, asn_org_id, upload, ip, mbps, min_rtt FROM `+"`%s`"+`
			ARRAY JOIN geospace_ids AS geospace_id
			WHERE cityHash64(ip) %% %d = %d)`, work, n, i)
		for _, v := range summaryVariants {
			if err := s.exec(ipMediansInsert(v.ipMedians+suffix, v, source, version)); err != nil {
				return errors.Wrap(err, "summarizer#updateIPMedians insert")
			}
		}
	}
	log.Printf("summarizer: ip medians of %d (test, geospace) rows of the IPs tested from %s to %s, %d shards\n",
		rows, from.Format("2006-01-02"), to.Format("2006-01-02"), n)
	return nil
}

type shard struct {
	upload    bool
	geospaces []string
	rows      uint64
}

// shards splits the rows of source (with geospace_id, upload) into groups of whole geospaces of
// about ShardTargetRows each. Every summary row belongs to a single geospace and upload, so each
// shard can be aggregated on its own.
func (s *Summarizer) shards(source string) ([]shard, error) {
	rows, err := s.conn.Query(s.ctx(), fmt.Sprintf(`
		SELECT upload, toString(geospace_id), count()
		FROM %s
		GROUP BY upload, geospace_id
		ORDER BY upload, geospace_id`, source))
	if err != nil {
		return nil, errors.Wrap(err, "summarizer#shards Query")
	}
	defer rows.Close()
	result := []shard{}
	var cur *shard
	for rows.Next() {
		var upload bool
		var geo string
		var n uint64
		if err := rows.Scan(&upload, &geo, &n); err != nil {
			return nil, errors.Wrap(err, "summarizer#shards Scan")
		}
		if cur == nil || cur.upload != upload || (cur.rows > 0 && cur.rows+n > s.opts.ShardTargetRows) {
			result = append(result, shard{upload: upload})
			cur = &result[len(result)-1]
		}
		cur.geospaces = append(cur.geospaces, geo)
		cur.rows += n
	}
	return result, rows.Err()
}

// allTimeFromIPMedians rebuilds an all-time summary from its per-IP medians, in shards of
// geospaces, into a staging table that is then exchanged with table.
func (s *Summarizer) allTimeFromIPMedians(table string, w summaryWindow, v summaryVariant, ipMedians string) error {
	start := time.Now()
	staging := table + "_staging"
	if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging)); err != nil {
		return errors.Wrap(err, "summarizer#allTimeFromIPMedians drop staging")
	}
	if err := s.createSummaryTable(staging, w, v); err != nil {
		return err
	}
	defer s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging))
	shards, err := s.shards(fmt.Sprintf("`%s`", ipMedians))
	if err != nil {
		return err
	}
	keys := []string{"m_ip.geospace_id"}
	inner := "geospace_id, "
	if v.withASN {
		keys = append(keys, "m_ip.asn_org_id")
		inner += "asn_org_id, "
	}
	keys = append(keys, "m_ip.upload")
	for _, sh := range shards {
		query := fmt.Sprintf(`
			INSERT INTO `+"`%s`"+` (med_mbps, med_min_rtt, bad_count, normal_count, good_count, total_samples, %s)
			SELECT %s
			FROM (
				SELECT %s upload, med_mbps AS med_ip_mbps, med_min_rtt AS med_ip_rtt
				FROM `+"`%s`"+` FINAL
				WHERE upload = %t AND geospace_id IN ('%s')
			) m_ip
			GROUP BY %s`,
			staging, strings.Join(summaryKeys(w, v), ", "), outerSummaryColumns(keys),
			inner, ipMedians, sh.upload, strings.Join(sh.geospaces, "', '"), strings.Join(keys, ", "))
		if err := s.exec(query); err != nil {
			return errors.Wrap(err, "summarizer#allTimeFromIPMedians insert")
		}
	}
	if err := s.exec(fmt.Sprintf("EXCHANGE TABLES `%s` AND `%s`", staging, table)); err != nil {
		return errors.Wrap(err, "summarizer#allTimeFromIPMedians exchange")
	}
	log.Printf("summarizer: %s in %d shards, %v\n", table, len(shards), time.Since(start))
	return nil
}

// buildUSASNs rebuilds us_asns (ASN orgs with samples per geospace) from summary_alltime.
func (s *Summarizer) buildUSASNs(suffix string) error {
	table := usASNsTable + suffix
	staging := usASNsTable + suffix + "_staging"
	if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging)); err != nil {
		return errors.Wrap(err, "summarizer#buildUSASNs drop staging")
	}
	if err := s.exec(fmt.Sprintf("CREATE TABLE `%s` (name String, id UUID, geospace_id UUID, total UInt64) ENGINE = MergeTree ORDER BY (geospace_id, total)", staging)); err != nil {
		return errors.Wrap(err, "summarizer#buildUSASNs create staging")
	}
	defer s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging))
	if err := s.exec(fmt.Sprintf(`
		INSERT INTO `+"`%s`"+` (name, id, geospace_id, total)
		SELECT a.name, a.id, s.geospace_id, s.total
		FROM (
			SELECT s.asn_org_id, s.geospace_id, SUM(s.total_samples) AS total
			FROM `+"`summary_alltime%s`"+` s
			GROUP BY s.asn_org_id, s.geospace_id
		) s
		JOIN asn_orgs a ON a.id = s.asn_org_id
		WHERE a.name != ''`, staging, suffix)); err != nil {
		return errors.Wrap(err, "summarizer#buildUSASNs insert")
	}
	return wrap(s.exec(fmt.Sprintf("EXCHANGE TABLES `%s` AND `%s`", staging, table)), "summarizer#buildUSASNs exchange")
}

func (s *Summarizer) ensureTables(suffix string) error {
	for _, w := range summaryWindows {
		for _, v := range summaryVariants {
			if err := s.createSummaryTable(v.prefix+w.name+suffix, w, v); err != nil {
				return err
			}
		}
	}
	for _, v := range summaryVariants {
		if err := s.createIPMediansTable(v.ipMedians+suffix, v); err != nil {
			return err
		}
	}
	return wrap(
		s.exec(fmt.Sprintf("CREATE TABLE IF NOT EXISTS `%s%s` (name String, id UUID, geospace_id UUID, total UInt64) ENGINE = MergeTree ORDER BY (geospace_id, total)", usASNsTable, suffix)),
		"summarizer#ensureTables us_asns",
	)
}

func (s *Summarizer) tableExists(name string) (bool, error) {
	var n uint64
	if err := s.conn.QueryRow(s.ctx(), "SELECT count() FROM system.tables WHERE database = currentDatabase() AND name = ?", name).Scan(&n); err != nil {
		return false, errors.Wrap(err, "summarizer#tableExists")
	}
	return n > 0, nil
}

// dataRange returns the first and last test time. count/min/max of the partition column are
// answered from part metadata (minmax_count projection): no scan and no system.parts access.
func (s *Summarizer) dataRange() (*time.Time, *time.Time, error) {
	var n uint64
	var from, to time.Time
	if err := s.conn.QueryRow(s.ctx(), `SELECT count(), min(time), max(time) FROM tests`).Scan(&n, &from, &to); err != nil {
		return nil, nil, errors.Wrap(err, "summarizer#dataRange")
	}
	if n == 0 {
		return nil, nil, nil
	}
	return &from, &to, nil
}

// wrap is errors.Wrap that keeps nil as nil (errors.Wrap(nil) returns a non-nil error).
func wrap(err error, msg string, args ...any) error {
	if err == nil {
		return nil
	}
	return errors.Wrap(err, msg, args...)
}

// ValidationResult compares a <table>_next built by RebuildAll with the live table.
type ValidationResult struct {
	Table   string
	Buckets int
	// Rows only in the live table, and only in the new one (a changed row counts in both).
	OnlyLive, OnlyNext uint64
}

// Validate compares, for every bucketed window except semester (whose buckets changed by
// design), the buckets that ended before `before` in <table>_next and the live table. Both are
// computed from the same tests, so they must be equal.
func (s *Summarizer) Validate(before time.Time) ([]ValidationResult, error) {
	first, _, err := s.dataRange()
	if err != nil {
		return nil, err
	}
	if first == nil {
		return nil, errors.New("summarizer#Validate no tests")
	}
	result := []ValidationResult{}
	for _, w := range summaryWindows {
		if w.buckets == nil || w.name == "semester" || !s.wantsWindow(w.name) {
			continue
		}
		buckets, err := s.buckets(w, *first, before.AddDate(0, 0, -1))
		if err != nil {
			return nil, err
		}
		cutoff := before.UTC().Format("2006-01-02")
		values := []string{}
		for _, b := range buckets {
			if b.lastDay < cutoff {
				values = append(values, "("+strings.Join(b.values, ", ")+")")
			}
		}
		if len(values) == 0 {
			continue
		}
		bucketCols := []string{}
		for _, c := range w.buckets {
			bucketCols = append(bucketCols, c.name)
		}
		for _, v := range summaryVariants {
			table := v.prefix + w.name
			cols := "med_mbps, med_min_rtt, bad_count, normal_count, good_count, total_samples, " + strings.Join(summaryKeys(w, v), ", ")
			where := fmt.Sprintf("(%s) IN (%s)", strings.Join(bucketCols, ", "), strings.Join(values, ", "))
			if len(bucketCols) == 1 {
				where = fmt.Sprintf("%s IN (%s)", bucketCols[0], strings.Join(values, ", "))
			}
			diff := func(a, b string) (uint64, error) {
				var n uint64
				err := s.conn.QueryRow(s.ctx(), fmt.Sprintf(
					"SELECT count() FROM (SELECT %[1]s FROM `%[2]s` WHERE %[4]s EXCEPT SELECT %[1]s FROM `%[3]s` WHERE %[4]s)",
					cols, a, b, where)).Scan(&n)
				return n, wrap(err, "summarizer#Validate %s", table)
			}
			r := ValidationResult{Table: table, Buckets: len(values)}
			if r.OnlyLive, err = diff(table, table+"_next"); err != nil {
				return nil, err
			}
			if r.OnlyNext, err = diff(table+"_next", table); err != nil {
				return nil, err
			}
			result = append(result, r)
		}
	}
	return result, nil
}
