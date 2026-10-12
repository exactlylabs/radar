# Incremental summaries

> Update (summarizer v4, 2026-10-11): per-IP medians are computed once per window in the
> order of `tests`' sort key, and the state and county rows of the ordinary IPs are derived
> from that single aggregation. See "Summarizer v4" below; the design after it still holds.
>
> Update (summarizer v3): summaries read the `tests` table (one row per test, see
> `migrations/004_tests.sql`) instead of `measurements`, and the all-time tables are
> rebuilt from `ip_medians` / `ip_medians_geospace` (exact per-IP all-time medians, updated
> only for the IPs tested in the ingested days) instead of from all history. Production
> runbook and measurements: `../../docs/pipeline-rebuild-plan.md`.

## Summarizer v4: per-IP medians once per window, in key order

Where v3's time went (`-full`, measured on production 2019, 216 M tests): every bucket of
every window and variant ran 4 passes (states, counties, tribal, extras) of a shard-count
query plus a hash `GROUP BY ... quantileExact` over the bucket's tests, i.e. 16 queries per
bucket that each read the bucket again (and, for weeks, read the whole month partition,
since `time` is last in the sort key: a one-week filter reads 83 % of the month). One month
bucket, both variants, cost 25 s / 42 CPU-s at 6 threads, 2.2 GiB peak; the per-IP
`quantileExact` aggregation was done 4 times per window (state and county, with and without
ASN), 20 times in all, and each hash aggregation needed ~2 GiB per 28 M tests, hence the
150 M-row shards.

v4 (`summarizer.go`):

1. **One streaming aggregation per window and calendar year.** `GROUP BY upload, state_id,
   county_id, asn_org_id, ip, <bucket>` is a prefix of `tests`' sort key when the bucket is a
   monotonic function of `time` (`toYYYYMM`, `toStartOfQuarter`, `toStartOfInterval(6 MONTH)`,
   `toStartOfWeek(time, 0)`, `toYear`; ClickHouse matches them, `EXPLAIN PLAN sorting=1` shows
   `Order: upload, state_id, county_id, asn_org_id, ip, toStartOfWeek(time, 0)`), so with
   `optimize_aggregation_in_order = 1` groups are finalized as the stream advances: a whole
   year in one pass at 0.2-0.3 GiB per query instead of 2 GiB per 28 M rows. The legacy bucket
   columns (`YEAR`, `WEEK`, ...) are computed from `min(time)` of the group, which equals the
   per-test value because every test of a group is in the same bucket of the same calendar
   year (chunks never cross a year). A ClickHouse in-order aggregation uses about one and a
   half cores whatever `max_threads` (the ranges of one part are merged in key order), so the
   year is split into shards of whole `(upload, state)` groups (`-shard-rows` tests each,
   pruned by the sort key) that run `-parallel` at a time.
2. **Derive instead of recomputing.** An IP whose tests of a bucket all have one
   (state, county, ASN) has, for its state and its county, with or without ASN, the median
   of exactly the same tests, so those four per-IP rows are the one row of step 1. The IPs
   with several (state, county, ASN) in a bucket (`splits`: none in the whole of 2019,
   geolocation and ASN are per IP) and every test with a tribal or extra geospace are copied
   once into a small work table and aggregated per geospace as the views did. The union is
   exactly the per-IP rows of the views; `summarizer_test.go` checks it against the legacy
   view SQL with a fixture where 80 % of an IP's tests are in its home county and ASN and the
   rest span other counties, states and ASNs (mutations caught: splits treated as ordinary
   IPs, the per-geospace rows dropped, the split filter inverted).
3. **Outer aggregation from the work tables**, per variant, upload and shard of geospace
   hashes, then `REPLACE PARTITION` of every bucket of the chunk.
4. **All-time** is the same chunk with no bucket over the whole table; its per-IP rows are
   written to `ip_medians` / `ip_medians_geospace`, from which `summary_*alltime` are built
   as before. The daily update of `ip_medians` is unchanged.

Rejected on measurement: a hashed non-prefix key next to the in-order prefix (e.g. `tribal_id`
or `(YEAR, MONTH)`) makes the in-order transform 2.5x slower (per-run hash tables); grouping
sets or an intermediate of all values (`quantileExactState`) cost as much as the aggregation
they'd save; a projection on `tests` would double ingest work.

Measured on production 2019 (216 M tests, 10 cores shared with the running conversion):

| Step (2019, month window unless noted) | v3 | v4 |
|---|---|---|
| Per-IP aggregation of one month, county pass with ASN (hash) | 7.7 s, 10.4 CPU-s, 2.1 GiB (6 threads) | same `GROUP BY` in key order: 7.6 s, 7.3 CPU-s, 0.39 GiB; it uses ~1.5 cores whatever `max_threads` (sharded: 29 M tests in 4.1 s, 5.2 CPU-s, 0.6 GiB) |
| One month bucket, both variants, 4 passes (12 queries) | 25 s, 42 CPU-s | n/a: a calendar year is one chunk |
| Whole year, per-IP rows of every pass and variant | 12 x 25 s = **300 s, 500 CPU-s** (month); year window: 8 hash shards of ~108 M tests, 48 s / 55 CPU-s / 4.7 GiB each = **~7 min** | 6 shard queries of <= 50 M tests, 4 at a time, 2 threads each: **31 s wall, 56 CPU-s, <= 1.4 GiB each**; shard counts 3-6 s; split IPs: 0; work table scan 3.2 s / 5.8 CPU-s |
| One week bucket | reads 83 % of the month partition (`time` is last in the key): the week window costs ~2x the month window | same as any window |
| Outer aggregation | included above | ~0.5 us per (per-IP row, geospace, variant); 2019: ~45 CPU-s |

Local synthetic 24 M tests (3 M IPs, 16 cores, both binaries, every output table identical):
v3 `-full` 4 min 36 s, v4 2 min 37 s; v4 is bound there by the outer and the insert of the
per-IP rows (39 % of the tests are a per-IP row, against 11 % in production 2019).

Projection for the full rebuild (4.65 B tests, 10 cores, measured per-row costs): v3 month
window ~70 min, week ~140 min, year/semester/quarter ~60 min each, all-time ~45 min: **5-7 h**;
v4: 6 streaming passes of ~11 min each at `-parallel 4` under the conversion's load (less
without it), plus scans, outer aggregations and `ip_medians`: **1.5-2 h**, memory <=
`-parallel` x 1.3 GiB for the shard queries and ~ShardTargetRows x 40 B per outer query.
Daily update: the current year's chunk (fine pass ~1 min for 400 M tests, scan, outer) plus
semester/quarter/month/week and the unchanged all-time update: **~10-15 min**, against
30-40 min for v3's 8 hash queries over the year bucket alone.

Settings that matter, all in `summarizer.go`: `optimize_aggregation_in_order = 1`;
`read_in_order_two_level_merge_threshold = 0` with `max_block_size = 8192` and
`aggregation_in_order_max_block_bytes = 4e6` (without the preliminary merge every part of the
range is its own aggregating stream with its own buffers: a 84-part range took 1.21 GiB,
0.18 GiB with them); the in-order aggregation keeps its arena to the end, ~25 B per test of
the query, hence shards of `-shard-rows` tests (big states split by county). Not useful:
`read_in_order_use_virtual_row`, `merge_tree_min_rows_for_concurrent_read` (noise),
`max_read_buffer_size`.

## Problem (measured 2026-10-11 on mapping-db)

- `Summarize` dropped and re-created all 12 `summary_*` tables with
  `CREATE MATERIALIZED VIEW ... POPULATE` over the whole `measurements` table
  (9.4 billion rows, 380 GiB) after every ingest. Each table took ~90 min, read
  ~8.6 billion rows and peaked at 26-28 GiB, so one run took ~18 hours.
- Most runs died with `MEMORY_LIMIT_EXCEEDED`: `quantileExact` keeps every value of
  every group in memory, and the all-time tables group by geospace x ASN x IP over
  all history. The last fully successful run was 2025-06-09, so the map has served
  summaries from June 2025 since then.
- The views stayed attached to `measurements` as insert triggers, so every ingest
  block re-ran the aggregations. Leftover `*_tmp` views from failed runs were still
  attached.
- To keep those triggers from firing, the measurement storage exchanged
  `measurements` with an empty `measurements_tmp` while inserting and exchanged
  back on `Close`. A crash between the two exchanges left the data in
  `measurements_tmp`, and the next run's first statement was
  `DROP TABLE measurements_tmp`, which would delete all measurements.

## What stays the same

- Table names, columns and column types the API reads (`summary_<window>`,
  `summary_geospace_<window>`, `us_asns`). The API and frontend are unchanged.
- The numbers. Each summary is still the exact median (`quantileExact`) of the
  exact per-IP medians, with the same good/normal/bad thresholds and the same
  bucket expressions, with one fix: the map sends semester 1 for Jan-Jun and 2 for
  Jul-Dec, but the views computed `MONTH / 6 + 1`, which put June in semester 2
  and December in a semester 3 the map never requested. Semester is now
  `(MONTH - 1) / 6 + 1`.
- The hourly ingestor only summarizes when it inserted something. It used to
  rebuild everything every hour, because the last ingested day's files are found
  again until the next day's appear.

## Design

Every row of every summary depends only on measurements of one geospace in one time
bucket (week, month, quarter, semester, year) or, for all-time, one geospace. So:

1. **Plain tables, no materialized views.** Summary tables are ordinary
   `MergeTree` tables partitioned by their bucket (`(year, week)`, `(year, month)`,
   ..., `year`; all-time unpartitioned). Inserts into `measurements` no longer
   trigger anything, so the measurements table swap is removed and ingest writes
   straight into `measurements`.
2. **Recompute only touched buckets.** After an ingest of dates `[from, to]`,
   `Summarize(from, to)` recomputes the buckets that contain those dates. Each
   bucket is computed from its own time range (the `time` minmax index skips the
   rest of the table) into a staging table, then swapped in atomically with
   `ALTER TABLE ... REPLACE PARTITION`. The map never sees a half-written bucket.
3. **Bounded memory.** Large buckets (year, semester and all-time) are computed in
   shards of geospaces, sized from row counts so each shard reads about as much
   as one month (~150M rows, ~5 GiB peak). A summary row never spans geospaces, so
   shards are independent and their results are exact.
4. **All-time** is rebuilt into a staging table shard by shard and exchanged in
   with `EXCHANGE TABLES`, then `us_asns` is rebuilt from it the same way.

Measured on one month (June 2026, 155M rows, 8 threads): both variants (with and
without ASN) take 15 s.

| | Before | After (estimate from measurements) |
|---|---|---|
| Daily update | ~18 h, mostly failing | ~15-20 min (all-time dominates) |
| Full rebuild | ~18 h, has not completed since 2025-06 | ~1.5-2 h |
| Peak memory | 26-28 GiB (limit) | a few GiB per shard |

## Rollout (no map downtime)

1. Deploy the new `mlab-ingestor` and `summarize` binaries with the ingestor and
   processor still stopped.
2. `summarize --full`: builds every summary into `<name>_next` tables while the
   map keeps serving the current tables.
3. Validate: summaries for buckets that ended before 2025-06-09 must equal the
   current tables exactly (same method, same data).
4. `summarize --switch`: drops the leftover `*_tmp` views and tables, exchanges
   each `<name>_next` with its live table, and keeps the old ones as `<name>_old`
   for rollback until dropped by hand.
5. Start the ingestor, then the processor, which catches up from 2026-08.

Rollback: exchange `<name>_old` back, and redeploy the previous binaries.

### Per-geospace step (2026-10-11, after the first production `-full`)

The all-time window of the production rebuild put 1.23 B tests (26 % of all) through the
per-geospace path: over 17 years most IPs are seen in several counties, so they are "split"
and their state and county rows are recomputed per geospace. That step aggregated the work
table in 25 hash shards of IPs, and every shard re-read the whole table once per pass (four
passes): ~100 scans of 1.23 B rows, 28 min for the window. It is now one streaming query
per variant: the work table is ordered by `(upload, ip)`, each test is expanded to its
geospaces with an `ARRAY JOIN` (which keeps the read order, checked with `EXPLAIN PIPELINE`
on 24.6 and 26.8: `AggregatingInOrderTransform` over `ArrayJoinTransform`), and the
aggregation holds the few (geospace, ASN) keys of one IP at a time. One scan instead of 100.

`-full -windows a,b` now keeps the `_next` tables of the other windows, so a rebuild can be
resumed window by window after a stop.
