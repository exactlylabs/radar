package clickhousestorages

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
)

// The map reads one summary table per window and variant: summary_<window> (per geospace
// and ASN org) and summary_geospace_<window> (per geospace). Each row is the median of the
// per-IP medians of the measurements of one geospace in one time bucket.
//
// A row only depends on the measurements of its own geospace and bucket, so after an
// ingest only the buckets containing the ingested dates are recomputed. Each bucket is
// computed in shards of geospaces into a staging table and swapped in with REPLACE PARTITION
// (or EXCHANGE TABLES for the unpartitioned all-time tables), so readers never see a
// partially written bucket and memory is bounded by the shard size, not by all history.
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
}

var summaryVariants = []summaryVariant{
	{"summary_", true},
	{"summary_geospace_", false},
}

const usASNsTable = "us_asns"

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

type SummarizerOptions struct {
	// Only build these windows (alltime, year, semester, quarter, month, week); nil means all.
	Windows []string
	// Measurements of a shard, at most. A single geospace bigger than this is still one shard.
	ShardTargetRows uint64
	MaxThreads      int
	MaxMemoryUsage  uint64
	// Spill GROUP BY to disk past this many bytes, well below MaxMemoryUsage.
	MaxBytesBeforeExternalGroupBy uint64
}

var DefaultSummarizerOptions = SummarizerOptions{
	ShardTargetRows:               150_000_000,
	MaxThreads:                    8,
	MaxMemoryUsage:                20_000_000_000,
	MaxBytesBeforeExternalGroupBy: 8_000_000_000,
}

type Summarizer struct {
	conn driver.Conn
	opts SummarizerOptions
}

func NewSummarizer(conn driver.Conn, opts SummarizerOptions) *Summarizer {
	return &Summarizer{conn: conn, opts: opts}
}

func (s *Summarizer) ctx() context.Context {
	return clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
		"max_threads":                        s.opts.MaxThreads,
		"max_memory_usage":                   s.opts.MaxMemoryUsage,
		"max_bytes_before_external_group_by": s.opts.MaxBytesBeforeExternalGroupBy,
	}))
}

func (s *Summarizer) exec(query string, args ...any) error {
	return s.conn.Exec(s.ctx(), query, args...)
}

// Update recomputes, in the live tables, every bucket that contains a day in [from, to].
func (s *Summarizer) Update(from, to time.Time) error {
	if err := s.ensureTables(""); err != nil {
		return err
	}
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
	return s.build("", from, to)
}

// RebuildAll computes every summary from all measurements into <table>_next tables,
// leaving the live tables untouched. Use SwitchOver to put them live.
func (s *Summarizer) RebuildAll() error {
	from, to, err := s.dataRange()
	if err != nil {
		return err
	}
	if from == nil {
		return errors.New("summarizer#RebuildAll no measurements")
	}
	for _, name := range SummaryTables() {
		if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s_next`", name)); err != nil {
			return errors.Wrap(err, "summarizer#RebuildAll drop next")
		}
	}
	if err := s.ensureTables("_next"); err != nil {
		return err
	}
	return s.build("_next", *from, *to)
}

// SwitchOver drops the leftover *_tmp materialized views and tables of the old Summarize
// (some are still attached to measurements as insert triggers) and puts the <table>_next
// tables built by RebuildAll live. The replaced tables are kept as <table>_old.
func (s *Summarizer) SwitchOver() error {
	for _, name := range SummaryTables() {
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
	for _, name := range SummaryTables() {
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

func (s *Summarizer) build(suffix string, from, to time.Time) error {
	start := time.Now()
	builtAllTime := false
	for _, w := range summaryWindows {
		if !s.wantsWindow(w.name) {
			continue
		}
		if w.buckets == nil {
			builtAllTime = true
		}
		for _, v := range summaryVariants {
			table := v.prefix + w.name + suffix
			var err error
			if w.buckets == nil {
				err = s.buildAllTime(table, w, v)
			} else {
				err = s.buildBuckets(table, w, v, from, to)
			}
			if err != nil {
				return errors.Wrap(err, "summarizer#build %s", table)
			}
		}
	}
	// us_asns is derived from summary_alltime.
	if builtAllTime {
		if err := s.buildUSASNs(suffix); err != nil {
			return err
		}
	}
	log.Printf("summarizer: built %s to %s in %v\n", from.Format(time.DateOnly), to.Format(time.DateOnly), time.Since(start))
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
	f, t := from.UTC().Format(time.DateOnly), to.UTC().Format(time.DateOnly)
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
	if err := s.createSummaryTable(staging, w, v); err != nil {
		return err
	}
	defer s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging))
	for _, b := range buckets {
		start := time.Now()
		filter := fmt.Sprintf("m.time >= toDateTime('%s', 'UTC') AND m.time < toDateTime('%s', 'UTC') + INTERVAL 1 DAY", b.firstDay, b.lastDay)
		for i, c := range w.buckets {
			filter += fmt.Sprintf(" AND %s = %s", fmt.Sprintf(c.expr, "m.time"), b.values[i])
		}
		if err := s.exec(fmt.Sprintf("TRUNCATE TABLE `%s`", staging)); err != nil {
			return errors.Wrap(err, "summarizer#buildBuckets truncate")
		}
		shards, err := s.fill(staging, w, v, filter)
		if err != nil {
			return err
		}
		if err := s.exec(fmt.Sprintf("ALTER TABLE `%s` REPLACE PARTITION %s FROM `%s`", table, b.partition(), staging)); err != nil {
			return errors.Wrap(err, "summarizer#buildBuckets replace partition")
		}
		log.Printf("summarizer: %s %s in %d shards, %v\n", table, b.partition(), shards, time.Since(start))
	}
	return nil
}

func (s *Summarizer) buildAllTime(table string, w summaryWindow, v summaryVariant) error {
	start := time.Now()
	staging := table + "_staging"
	if err := s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging)); err != nil {
		return errors.Wrap(err, "summarizer#buildAllTime drop staging")
	}
	if err := s.createSummaryTable(staging, w, v); err != nil {
		return err
	}
	defer s.exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", staging))
	shards, err := s.fill(staging, w, v, "1")
	if err != nil {
		return err
	}
	if err := s.exec(fmt.Sprintf("EXCHANGE TABLES `%s` AND `%s`", staging, table)); err != nil {
		return errors.Wrap(err, "summarizer#buildAllTime exchange")
	}
	log.Printf("summarizer: %s in %d shards, %v\n", table, shards, time.Since(start))
	return nil
}

type shard struct {
	upload    bool
	geospaces []string
	rows      uint64
}

// shards splits the measurements matching filter into groups of whole geospaces of about
// ShardTargetRows each. Every summary row belongs to a single geospace and upload, so each
// shard can be aggregated on its own.
func (s *Summarizer) shards(filter string) ([]shard, error) {
	rows, err := s.conn.Query(s.ctx(), fmt.Sprintf(`
		SELECT m.upload, toString(m.geospace_id), count()
		FROM measurements m WHERE %s
		GROUP BY m.upload, m.geospace_id
		ORDER BY m.upload, m.geospace_id`, filter))
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

func (s *Summarizer) fill(table string, w summaryWindow, v summaryVariant, filter string) (int, error) {
	shards, err := s.shards(filter)
	if err != nil {
		return 0, err
	}
	for _, sh := range shards {
		f := fmt.Sprintf("%s AND m.upload = %t AND m.geospace_id IN ('%s')", filter, sh.upload, strings.Join(sh.geospaces, "', '"))
		if err := s.exec(insertSummaryQuery(table, w, v, f)); err != nil {
			return 0, errors.Wrap(err, "summarizer#fill insert")
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
	order := []string{"upload", "geospace_id"}
	if v.withASN {
		cols = append(cols, "asn_org_id UUID")
		order = append(order, "asn_org_id")
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

// insertSummaryQuery is the original view definition, restricted to the measurements matching filter.
func insertSummaryQuery(table string, w summaryWindow, v summaryVariant, filter string) string {
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
		SELECT
			quantileExact(0.5)(m_ip.med_ip_mbps) AS med_mbps,
			quantileExact(0.5)(m_ip.med_ip_rtt) AS med_min_rtt,
			CountIf(med_ip_mbps < if(upload=0, 25, 3)) AS bad_count,
			CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) AS normal_count,
			CountIf(med_ip_mbps > if(upload=0, 100, 20)) AS good_count,
			Count(*) AS total_samples,
			%[3]s
		FROM (
			SELECT %[4]s,
				quantileExact(0.5)(m.mbps) AS med_ip_mbps,
				quantileExact(0.5)(m.min_rtt) AS med_ip_rtt
			FROM measurements m
			WHERE %[5]s
			GROUP BY %[6]s
		) m_ip
		GROUP BY %[3]s`,
		table, strings.Join(summaryKeys(w, v), ", "), strings.Join(outer, ", "),
		strings.Join(inner, ", "), filter, strings.Join(innerGroup, ", "))
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

// dataRange returns the first and last day with measurements.
func (s *Summarizer) dataRange() (*time.Time, *time.Time, error) {
	var n uint64
	var from, to time.Time
	if err := s.conn.QueryRow(s.ctx(), "SELECT count(), min(time), max(time) FROM measurements").Scan(&n, &from, &to); err != nil {
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
