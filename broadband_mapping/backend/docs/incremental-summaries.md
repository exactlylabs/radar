# Incremental summaries

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
  bucket expressions (including the existing semester formula, which puts December
  in semester 3).

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
