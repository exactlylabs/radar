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
// were repeated once per geospace (the old measurements layout), in one pass per namespace, so
// the numbers are those of the original materialized views.
//
// A row only depends on the tests of its own geospace and bucket, so after an ingest only the
// buckets containing the ingested dates are recomputed, in shards of geospaces, into a staging
// table that is swapped in with REPLACE PARTITION. The all-time tables are rebuilt from
// ip_medians (per-IP all-time medians), which is updated only for the IPs of the ingested days.
// See docs/incremental-summaries.md.

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
}

var (
	yearColumn = bucketColumn{"year", "UInt16", "YEAR(%[1]s)"}

	summaryWindows = []summaryWindow{
		{"alltime", nil},
		{"year", []bucketColumn{yearColumn}},
		// The map sends semester 1 for Jan-Jun and 2 for Jul-Dec. The original views computed
		// (MONTH / 6) + 1, which put June in 2 and December in a semester 3 the map never asks for.
		{"semester", []bucketColumn{yearColumn, {"semester", "Int64", "intDiv(MONTH(%[1]s) - 1, 6) + 1"}}},
		{"quarter", []bucketColumn{yearColumn, {"quarter", "UInt8", "toQuarter(%[1]s)"}}},
		{"month", []bucketColumn{yearColumn, {"month", "UInt8", "MONTH(%[1]s)"}}},
		{"week", []bucketColumn{yearColumn, {"week", "UInt8", "WEEK(%[1]s)"}}},
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

// geoPass selects the tests of one namespace: those with the namespace's column set, plus those
// listing a geospace of the namespace in extra_geospace_ids. The last pass (no namespace) takes
// the extra geospaces of unknown namespaces, so no (test, geospace) pair is left out.
type geoPass struct {
	namespace string
	column    string
}

var geoPasses = []geoPass{
	{"states", "state_id"},
	{"counties", "county_id"},
	{"tribal_tracts", "tribal_id"},
	{"", ""},
}

const knownNamespaces = "'states', 'counties', 'tribal_tracts'"

// allGeospacesExpr is the array of every geospace of a test row t.
const allGeospacesExpr = `arrayConcat(
	if(t.state_id IS NULL, [], [assumeNotNull(t.state_id)]),
	if(t.county_id IS NULL, [], [assumeNotNull(t.county_id)]),
	if(t.tribal_id IS NULL, [], [assumeNotNull(t.tribal_id)]),
	t.extra_geospace_ids)`

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
	// Test-geospace rows of a shard, at most. A single geospace bigger than this is still one shard.
	ShardTargetRows uint64
	MaxThreads      int
	// max_insert_threads of INSERT ... SELECT. ClickHouse 26.8 defaults it to the core count,
	// which multiplies memory, so it is always set.
	MaxInsertThreads int
	MaxMemoryUsage   uint64
	// Spill GROUP BY to disk past this many bytes, well below MaxMemoryUsage.
	MaxBytesBeforeExternalGroupBy uint64
	// Summary tables built at the same time (each runs its own queries, so memory adds up).
	Parallel int
}

var DefaultSummarizerOptions = SummarizerOptions{
	ShardTargetRows:               150_000_000,
	MaxThreads:                    8,
	MaxInsertThreads:              1,
	MaxMemoryUsage:                20_000_000_000,
	MaxBytesBeforeExternalGroupBy: 8_000_000_000,
	Parallel:                      1,
}

type Summarizer struct {
	conn driver.Conn
	opts SummarizerOptions
}

func NewSummarizer(conn driver.Conn, opts SummarizerOptions) *Summarizer {
	if opts.MaxInsertThreads <= 0 {
		opts.MaxInsertThreads = 1
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
	for _, name := range switchedTables() {
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
	type job struct {
		w summaryWindow
		v summaryVariant
	}
	jobs := []job{}
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
		for _, v := range summaryVariants {
			jobs = append(jobs, job{w, v})
		}
	}
	// Each table has its own staging table, so tables can be built side by side.
	parallel := s.opts.Parallel
	if parallel < 1 {
		parallel = 1
	}
	sem := make(chan struct{}, parallel)
	errs := make(chan error, len(jobs))
	var wg sync.WaitGroup
	for _, j := range jobs {
		wg.Add(1)
		sem <- struct{}{}
		go func(j job) {
			defer wg.Done()
			defer func() { <-sem }()
			table := j.v.prefix + j.w.name + suffix
			if err := s.buildBuckets(table, j.w, j.v, from, to); err != nil {
				errs <- errors.Wrap(err, "summarizer#build %s", table)
			}
		}(j)
	}
	wg.Wait()
	close(errs)
	if err := <-errs; err != nil {
		return err
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

func (s *Summarizer) buildBuckets(table string, w summaryWindow, v summaryVariant, from, to time.Time) error {
	buckets, err := s.buckets(w, from, to)
	if err != nil {
		return err
	}
	staging := table + "_staging"
	if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging)); err != nil {
		return errors.Wrap(err, "summarizer#buildBuckets drop staging")
	}
	if err := s.createSummaryTable(staging, w, v); err != nil {
		return err
	}
	defer s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging))
	for _, b := range buckets {
		start := time.Now()
		// The time range prunes tests' monthly partitions; the bucket expressions keep the
		// days of a week that belong to the neighbouring year out, as the views did.
		filter := fmt.Sprintf("t.time >= toDateTime('%s', 'UTC') AND t.time < toDateTime('%s', 'UTC') + INTERVAL 1 DAY", b.firstDay, b.lastDay)
		for i, c := range w.buckets {
			filter += fmt.Sprintf(" AND %s = %s", fmt.Sprintf(c.expr, "t.time"), b.values[i])
		}
		if err := s.exec(fmt.Sprintf("TRUNCATE TABLE `%s`", staging)); err != nil {
			return errors.Wrap(err, "summarizer#buildBuckets truncate")
		}
		shards := 0
		for _, p := range geoPasses {
			n, err := s.fillPass(staging, w, v, p, filter)
			if err != nil {
				return err
			}
			shards += n
		}
		if err := s.replacePartition(table, b.partition(), staging); err != nil {
			return err
		}
		log.Printf("summarizer: %s %s in %d shards, %v\n", table, b.partition(), shards, time.Since(start))
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
	var parts uint64
	if err := conn.QueryRow(ctx, fmt.Sprintf(
		"SELECT count() FROM system.parts WHERE database = currentDatabase() AND table = ? AND active AND partition = toString(%s) AND rows > 0",
		partitionLiteral(partition)), staging).Scan(&parts); err != nil {
		return errors.Wrap(err, "replacePartition count parts")
	}
	if parts == 0 {
		return wrap(conn.Exec(ctx, fmt.Sprintf("ALTER TABLE `%s` DROP PARTITION %s", table, partition)), "replacePartition drop %s %s", table, partition)
	}
	return wrap(conn.Exec(ctx, fmt.Sprintf("ALTER TABLE `%s` REPLACE PARTITION %s FROM `%s`", table, partition, staging)), "replacePartition %s %s", table, partition)
}

// partitionLiteral turns a partition expression ("2026", "(2026, 1)") into the expression whose
// toString is system.parts.partition ("2026", "(2026,1)").
func partitionLiteral(partition string) string {
	if strings.HasPrefix(partition, "(") {
		return "'" + strings.ReplaceAll(partition, " ", "") + "'"
	}
	return partition
}

// passSource is a subquery with one row per (test, geospace of the pass's namespace) among the
// tests matching filter (on t), restricted to the geospaces in only if given. Columns:
// geospace_id, asn_org_id, upload, ip, time, mbps, min_rtt.
func passSource(p geoPass, filter string, only []string) string {
	cols := "t.asn_org_id AS asn_org_id, t.upload AS upload, t.ip AS ip, t.time AS time, t.mbps AS mbps, t.min_rtt AS min_rtt"
	in := ""
	if only != nil {
		in = "('" + strings.Join(only, "', '") + "')"
	}
	var extraFilter string
	if p.namespace != "" {
		extraFilter = fmt.Sprintf("g IN (SELECT id FROM geospaces WHERE namespace = '%s')", p.namespace)
	} else {
		extraFilter = fmt.Sprintf("g NOT IN (SELECT id FROM geospaces WHERE namespace IN (%s))", knownNamespaces)
	}
	if in != "" {
		extraFilter += " AND g IN " + in
	}
	extras := fmt.Sprintf(`
			SELECT g AS geospace_id, %s FROM tests t ARRAY JOIN t.extra_geospace_ids AS g
			WHERE (%s) AND notEmpty(t.extra_geospace_ids) AND %s`, cols, filter, extraFilter)
	if p.column == "" {
		return "(" + extras + ")"
	}
	mainFilter := fmt.Sprintf("t.%s IS NOT NULL", p.column)
	if in != "" {
		mainFilter += fmt.Sprintf(" AND t.%s IN %s", p.column, in)
	}
	return fmt.Sprintf(`(
			SELECT assumeNotNull(t.%s) AS geospace_id, %s FROM tests t
			WHERE (%s) AND %s
			UNION ALL %s)`, p.column, cols, filter, mainFilter, extras)
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

// fillPass inserts the summaries of the geospaces of pass p, for the tests matching filter, into table.
func (s *Summarizer) fillPass(table string, w summaryWindow, v summaryVariant, p geoPass, filter string) (int, error) {
	shards, err := s.shards(passSource(p, filter, nil))
	if err != nil {
		return 0, err
	}
	for _, sh := range shards {
		f := fmt.Sprintf("%s AND t.upload = %t", filter, sh.upload)
		if err := s.exec(insertSummaryQuery(table, w, v, passSource(p, f, sh.geospaces))); err != nil {
			return 0, errors.Wrap(err, "summarizer#fillPass insert")
		}
	}
	return len(shards), nil
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

// insertSummaryQuery is the original view definition, over the (test, geospace) rows of source.
func insertSummaryQuery(table string, w summaryWindow, v summaryVariant, source string) string {
	inner := []string{"m.geospace_id"}
	innerGroup := []string{"m.geospace_id"}
	outer := []string{"m_ip.geospace_id"}
	if v.withASN {
		inner = append(inner, "m.asn_org_id")
		innerGroup = append(innerGroup, "m.asn_org_id")
		outer = append(outer, "m_ip.asn_org_id")
	}
	inner = append(inner, "m.upload")
	innerGroup = append(innerGroup, "m.upload", "m.ip")
	outer = append(outer, "m_ip.upload")
	for _, c := range w.buckets {
		inner = append(inner, fmt.Sprintf("%s AS %s", fmt.Sprintf(c.expr, "m.time"), c.name))
		innerGroup = append(innerGroup, c.name)
		outer = append(outer, "m_ip."+c.name)
	}
	return fmt.Sprintf(`
		INSERT INTO `+"`%s`"+` (med_mbps, med_min_rtt, bad_count, normal_count, good_count, total_samples, %[2]s)
		SELECT %[3]s
		FROM (
			SELECT %[4]s,
				quantileExact(0.5)(m.mbps) AS med_ip_mbps,
				quantileExact(0.5)(m.min_rtt) AS med_ip_rtt
			FROM %[5]s m
			GROUP BY %[6]s
		) m_ip
		GROUP BY %[7]s`,
		table, strings.Join(summaryKeys(w, v), ", "), outerSummaryColumns(outer),
		strings.Join(inner, ", "), source, strings.Join(innerGroup, ", "), strings.Join(outer, ", "))
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
		err = s.rebuildIPMedians(suffix)
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

// rebuildIPMedians computes the per-IP all-time medians of every geospace from all tests, in
// shards of geospaces (the key of tests prunes state and county shards).
func (s *Summarizer) rebuildIPMedians(suffix string) error {
	version := time.Now().UnixNano()
	for _, v := range summaryVariants {
		if err := s.exec(fmt.Sprintf("TRUNCATE TABLE `%s%s`", v.ipMedians, suffix)); err != nil {
			return errors.Wrap(err, "summarizer#rebuildIPMedians truncate")
		}
	}
	for _, p := range geoPasses {
		start := time.Now()
		shards, err := s.shards(passSource(p, "1", nil))
		if err != nil {
			return err
		}
		for _, sh := range shards {
			source := passSource(p, fmt.Sprintf("t.upload = %t", sh.upload), sh.geospaces)
			for _, v := range summaryVariants {
				if err := s.exec(ipMediansInsert(v.ipMedians+suffix, v, source, version)); err != nil {
					return errors.Wrap(err, "summarizer#rebuildIPMedians insert")
				}
			}
		}
		log.Printf("summarizer: ip medians of %q in %d shards, %v\n", p.namespace, len(shards), time.Since(start))
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

// dataRange returns the first and last test time, from the parts' minmax index (no scan).
func (s *Summarizer) dataRange() (*time.Time, *time.Time, error) {
	var n uint64
	var from, to time.Time
	if err := s.conn.QueryRow(s.ctx(), `
		SELECT sum(rows), min(min_time), max(max_time) FROM system.parts
		WHERE database = currentDatabase() AND table = 'tests' AND active AND rows > 0`).Scan(&n, &from, &to); err != nil {
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
