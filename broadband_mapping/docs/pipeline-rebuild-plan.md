# M-Lab pipeline rebuild plan

Written 2026-10-11 after a day of incident work. This is the plan to go straight to the
final shape of the M-Lab pipeline (processor → B2 → ClickHouse → map API) instead of
finishing the interim rebuild. It is written so that several agents can work on it in
parallel with no other context. Read all of it before starting a workstream.

## Ground rules

- The map (pods.radartoolkit.com mapping, api.mapping) is live. Nothing may break it. The
  API reads only `summary_<window>`, `summary_geospace_<window>`, `us_asns`, `geospaces`
  and `asn_orgs`; keep those names, columns and column types, and switch data with
  `EXCHANGE TABLES` / `REPLACE PARTITION`, never by dropping first.
- Build new tables next to old ones; validate; switch; keep the old as `_old` until the
  user says to drop. Never run `ALTER TABLE ... DELETE/UPDATE` on `measurements` (380 GiB,
  unpartitioned: a mutation rewrites everything).
- Database queries during investigation: read-only (`clickhouse-client --readonly=1`,
  `--max_execution_time`, `--max_threads=2` when something else is running).
- Never print secrets. Credentials live in `/opt/broadbandmapping/ingestor_env` and
  `processor_env` on mapping-db; source them in a subshell on the server.
- Don't delete server/application logs to free space; move them instead.
- Commits: authored as the user, no Co-Authored-By or Claude trailers. Branch:
  `mapping-incremental-summaries` in the `radar` repo (commits 66f98a5e, 60d2b01a so far),
  `mlab-processor` changes go on the same branch. Commit and push when a piece is done.
- Poll long jobs with short checks (≤ 60 s) and real progress signals; never blind waits.
- Keep Float64 for speeds and RTTs (user decision). Medians stay `quantileExact`.

## Hosts and paths

| What | Where |
|---|---|
| ClickHouse + processor + ingestor VM | `ssh clickhouse-db` (hostname mapping-db, Proxmox VM 109 "radar-processor-01", LAN 10.0.3.16, 10 cores, 32 GB; `sudo` without password) |
| ClickHouse | 24.6.2.17, database `mlab-mapping`, data disk `/mnt/clickhouse-data` (2 TB, ~900 GB free), logs `/var/log/clickhouse-server/` |
| Pipeline binaries | `/opt/broadbandmapping/`: `mlab-processor` (systemd `mlab-processor`, nightly loop), `process-mlab` (manual CLI: `-start D -end D -rerun -storage b2`), `mlab-ingestor` (systemd `mlab-ingestor`, hourly), `summarize`, staged `mlab-ingestor-v2` and `summarize-v2` (built from the branch) |
| Service env files | `/opt/broadbandmapping/ingestor_env`, `processor_env` (S3/B2 creds, DB creds) |
| B2 bucket | `radar-mlab-files-new` on `s3.us-east-005.backblazeb2.com` (`b2` CLI 4.0.3 installed; see "B2 state") |
| Map API | Swarm service `mapping-api_mapping-server` on radar-swarm-01 (`ssh radar-swarm-01`); image built from `broadband_mapping/backend/docker/Dockerfile`, pushed to `registry.radartoolkit.com` (push with `--provenance=false`; from jagular the registry must resolve to 10.0.2.13, see /etc/hosts) |
| Code | `radar/broadband_mapping/backend` (Go 1.18 module, ClickHouse driver clickhouse-go v2.9.1), `radar/broadband_mapping/frontend`, `radar/mlab-processor` (Go) |
| Local test ClickHouse | `docker run -d --rm --name ch-summarizer-test -p 127.0.0.1:19000:9000 -e CLICKHOUSE_SKIP_USER_SETUP=1 clickhouse/clickhouse-server:24.6`; tests run with `CLICKHOUSE_TEST_ADDR=127.0.0.1:19000 go test ./pkg/adapters/clickhousestorages/` |

Current state of services: `mlab-processor` and `mlab-ingestor` are **stopped and disabled**
(systemctl) until the new pipeline is deployed. The map serves the summary tables last
rebuilt on 2025-06-09.

## Facts measured on 2026-10-11

- `measurements`: 9.40 billion rows, 379.8 GiB, columns `id String (132 GiB), ip String (62),
  mbps Float64 (50), min_rtt Float64 (38), time DateTime('UTC') (32), loss_rate (20),
  latitude/longitude (15 each), location_accuracy_km (11), test_style (2.5),
  has_access_token (1.2), asn_org_id UUID (0.6), geospace_id UUID (0.6), upload Bool,
  access_token_sig (always empty)`. Sort key `(upload, geospace_id, asn_org_id, time)`,
  no partitioning, minmax skip index on `time`.
- Every test is stored once per matching geospace: 4.69 B county rows, 4.68 B state rows,
  30 M tribal rows (namespaces `counties`, `states`, `tribal_tracts`; ZIP codes and census
  tracts exist in `geospaces` but have no measurements). ~2.02 rows per test id.
- Only 7 columns are read by anything: `ip, time, upload, mbps, min_rtt, asn_org_id,
  geospace_id` (summaries). Nothing queries `measurements` at request time.
- Data range 2009-03 .. 2026-08-01. 2026 volume ≈ 65 M rows/month ≈ 2.5 M rows/day
  (≈ 1.25 M tests/day), ~215 k distinct IPs/day, ~1.5 M/week.
- One day's IPs own 0.62 % of all rows (58.5 M); one week's own 8.3 %.
- Old summaries took ~90 min and 26–28 GiB per table (12 tables) and OOM'd since 2025-06.
  Incremental rebuild measured: all-time shards ~4.4 M rows/s, peak 7.6 GiB; a one-month
  bucket (both variants) 15 s.
- Map usage (90 days of query_log): `summary_geospace_year` ~2,100 queries, `geospaces`
  ~1,300, `us_asns` ~450, `summary_year` with ASN 81, `summary_geospace_alltime` 57, week
  34, month 33, quarter/semester 0 (but the UI can request every window and both
  variants, so all 12 tables stay). Queries take 26–200 ms. Namespaces requested:
  counties (1,905), states (190), tribal_tracts (77).
- Short (partially fetched) days: 59 days under 20 % of their month's median:
  2009-11-08, 2010-02-01..02, 2019-07-31, 2023-03-01..06, 2024-10-02, 03, 12, 2024-11-01,
  2024-12-08, 25, 2025-02-05..11, 2025-03-05, 06, 19, 24, 30, 31, 2025-04-01..03, 17..20,
  2025-05-02, 08, 10, 14, 26..31, 2025-06-01..03, 2026-06-19, 22, 29, 2026-07-01, 07, 13,
  14, 20, 22, 28. On these days ndt5 is complete (~25 k rows) and ndt7 has ~3 % of normal.
  Monthly medians drop to 0.6–1.5 M rows between 2024-10 and 2025-05 (2.5–5.5 M around
  it), so whole months there may be partial too.
- B2 state: 25,451 current files = 821 GB (`ipgeocode/` 431, `fetch/` 274,
  `reversegeocode/` 71, `measurementlink/` 45); 112,129 versions = 2,974 GB billed. On
  2026-10-11 a lifecycle rule "keep only last version" was set and `measurementlink/` was
  deleted (log `/var/log/b2-measurementlink-rm.log`). `fetch/` is kept as raw retention.
- The ingestor reads only `ipgeocode/<date>.avro` and `reversegeocode/<date>.avro`.

## Bugs found (all must be fixed by the workstreams below)

Processor (`radar/mlab-processor`):
1. `pkg/app/fetcher/fetch.go:359-368`: `processNdt7Reader`/`processNdt5Reader` errors are
   discarded (the code checks a stale `err`), so a failed fetch is uploaded as a complete
   day. Cause of the short days.
2. `pkg/services/s3storage/storage.go:83-91` + `datastore.go:119-129`: any HEAD error other
   than NotFound counts as "not done" → full redo of the day.
3. `s3storage/uploader.go:60-72`: upload retry reuses the file handle without seeking to 0;
   a retry can upload a truncated object that then counts as done.
4. `measurementlinker/linker.go:47-55`: both branches identical; `cleanIpMap` uses wall
   clock. The whole step's output is consumed by nothing.
5. Loads ZCTA and ~78 tract shapefiles (`reverse.go:145-167`, pointer per vertex) whose
   output the ingestor discards (`ingestor/reader.go:15-20`); non-US tests are fetched,
   geocoded and uploaded, then dropped by the ingestor (`reader.go:70`).
6. `NetMap` (`pkg/services/netmap/map.go:30-38`) allocates a string per prefix length per
   lookup; GeoLite/ASN maps and shapes stay resident forever in the nightly loop.
7. `datastore.go:78` leaks the file handle in `FileReader`.
8. `fetch.go:88-104` loads each test's whole JSON to use the last TCPInfo.

Backend (`radar/broadband_mapping/backend`), fixed on the branch already:
- measurements/measurements_tmp EXCHANGE around inserts (a crash between the swaps lost
  the data to the next run's `DROP TABLE measurements_tmp`): removed.
- Summaries were full materialized-view rebuilds: replaced by `summarizer.go`
  (partitioned plain tables, bucket recompute, shards, REPLACE PARTITION), tests in
  `summarizer_test.go` against `testdata/legacy_views/*.sql`.
- Hourly ingestor re-ran the full rebuild every hour; cursor `<` re-inserted the cursor
  second; semester was `MONTH/6+1` (map sends 1=Jan–Jun, 2=Jul–Dec): all fixed.

Backend, still open:
- `summariesstorage.go` `SummaryForGeospace`/`SummaryForGeoAndASN` never close `rows`.
- Tiles are decoded, filled and re-encoded per request (`vectortiles.go:96-139`); no
  `Cache-Control`; `summariesCache` hit re-unmarshals the whole namespace per tile.
- `LastDate()` is `ORDER BY time DESC LIMIT 1` (42 s full scan); use partition metadata.
  (Ingestor side done in C; the API's own use, if any, is F's.)
- `pkg/app/webapi` `TestAPI` fails on master (mock expectation; pre-existing).

Frontend: "Last month" sends `month=11` in January (`filters.ts:170-174`); year list stops
at 2025 (`filters.ts:79`).

Status (workstream F, branch `ws-api`): rows closed and `rows.Err()` checked; tiles cached as
encoded bytes (30 min) with decoded namespace summaries shared in memory (5 min, concurrent
loads collapsed) and `Cache-Control: public, max-age=300` on tiles/overview/geojson; `TestAPI`
fixed (and `/health` no longer always reports storages NOT OK); frontend month/week/year fixed.
`LastDate()` is ingestor-only and stays with C. The API image needs Go ≥ 1.20 to build
(`summarizer.go` uses `time.DateOnly`): `docker/Dockerfile` and `Dockerfile.setup-shapes`
now use golang 1.22; `Dockerfile.ingestor` still says 1.18 (C).

Recommendation for B (summarizer DDL): the ASN tables `summary_<w>` are sorted
`(upload, geospace_id, asn_org_id, …)`, but the API always filters them by `asn_org_id` (map
tiles: one ASN, a whole namespace), so ClickHouse reads the whole period partition. On a
synthetic month of 1.98 M rows (3 300 counties × 300 ASNs × 2), the tile query read 1.98 M rows
of `summary_month`; sorting by `(asn_org_id, upload, geospace_id, …)`, or adding
`PROJECTION by_asn (SELECT * ORDER BY asn_org_id, geospace_id, upload)`, cut that to 8 192 rows
(one granule) and the query time about in half (the remainder is the `geospaces` joins).
`us_asns` is built by full aggregation, so it doesn't care. The sort key is the cheaper option
(a projection doubles storage and must be materialized on `REPLACE PARTITION` sources too);
change it in `createSummaryTable` before the `-full` rebuild, as `EXCHANGE TABLES` doesn't
need equal sort keys but `REPLACE PARTITION` does.

## Target design

### `tests` table (ClickHouse, replaces `measurements`) — built (A)

One row per test, all fields kept, Float64 metrics, US tests only (user decision: tests with
no US state/county/tribal match are dropped, as before). DDL in
`backend/migrations/004_tests.sql` (the comment there has the measurements):

```sql
CREATE TABLE IF NOT EXISTS tests (
    time                 DateTime('UTC') CODEC(Delta, ZSTD(3)),
    id                   String CODEC(ZSTD(3)),
    test_style           LowCardinality(String),
    ip                   IPv6 CODEC(ZSTD(3)),  -- IPv4 as ::ffff:a.b.c.d
    upload               Bool,
    mbps                 Float64 CODEC(ZSTD(3)),
    min_rtt              Float64 CODEC(ZSTD(3)),
    loss_rate            Float64 CODEC(ZSTD(3)),
    latitude             Float64 CODEC(ZSTD(3)),
    longitude            Float64 CODEC(ZSTD(3)),
    location_accuracy_km Float64 CODEC(ZSTD(3)),
    has_access_token     Bool,
    access_token_sig     String,
    asn_org_id           UUID,
    state_id             Nullable(UUID),
    county_id            Nullable(UUID),
    tribal_id            Nullable(UUID),
    extra_geospace_ids   Array(UUID)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(time)
ORDER BY (upload, state_id, county_id, asn_org_id, ip, time)
SETTINGS index_granularity = 8192, allow_nullable_key = 1;
```

Deviations from the first draft, all measured on production samples (2019-06-01: 978,188
tests; part of 2026-07-15: 595,786 tests; exported read-only and loaded into a local
ClickHouse 26.8):
- **A test can be in two geospaces of one namespace**: 0.20 % of 2019-06-01's tests and
  0.07 % of the 2026 sample have two counties (Virginia independent cities + their county,
  e.g. Roanoke 51161 + Salem 51775; Arapahoe 08005 + Denver 08031), and the ingestor maps
  both US_TRIBAL_TRACTS and US_AIANNH to tribal_tracts. Single columns would drop those
  pairs (Salem would lose most of its tests), so the smallest id per namespace (as a
  string) is the column and the others go to `extra_geospace_ids`. Geospaces of an unknown
  namespace also go there. Summaries and ip_medians count every pair, exactly as before.
- **id stays a plain String**: ndt5/ndt7 ids are `<prefix>_<unix s>_<16 hex>` (prefix
  `ndt-xxxxx` or `ndt-virtual-xxxxx`, 37–45 chars), but web100-era ids (2009–2019) are
  random UUIDs. Bytes per test: plain ZSTD(3) 18.85 (web100) / 5.38 (ndt); split
  prefix/ts/seq + UUID column 16.07 / 6.10. Not worth four columns.
- **ZSTD(3) on floats and ip**: whole row 36.2 → 30.8 B (2019) and 31.1 → 23.6 B (2026)
  vs default LZ4. Same tests in `measurements`: 56.6 B per test-row (×2.02 rows per test),
  so `tests` ≈ 28 % of `measurements` ≈ **105 GiB** for ~4.65 B tests.
- **No ip bloom filter**: the incremental all-time looks up one day's IPs (~1 % of all
  tests, spread over every granule), so a skip index would match nearly every granule.
  Add one later with `ALTER TABLE tests ADD INDEX` if single-IP analysis needs it.
- `state_id` is in the sort key so state shards prune like county shards.

### Summaries (`summarizer.go` v3) — built (B)

Same 13 output tables, names, columns and types (the map reads them by name). Changes:
- Every bucket of every window and variant is computed in four passes over `tests`:
  states (`state_id` ∪ extra ids that are states), counties, tribal_tracts, and extra ids
  of unknown namespaces; each pass is sharded by geospace (`-shard-rows`, default 150 M
  test-geospace rows) and written to a staging table that replaces the bucket's partition.
  Partition pruning is by `toYYYYMM(time)`.
- `summary_<window>` (the with-ASN variant, always read for one ASN org by the map) is
  ordered `(asn_org_id, upload, geospace_id, <bucket columns>)`; `summary_geospace_<window>`
  keeps `(upload, geospace_id, ...)`. This takes effect with `-full`/`-switch`.
- All-time is incremental through two ReplacingMergeTree tables of exact per-IP all-time
  medians, one row per geospace the IP's tests are in:
  `ip_medians (upload Bool, geospace_id UUID, asn_org_id UUID, ip IPv6, med_mbps Float64,
  med_min_rtt Float64, samples UInt64, version UInt64) ENGINE = ReplacingMergeTree(version)
  ORDER BY (upload, geospace_id, asn_org_id, ip)` (for `summary_alltime`), and
  `ip_medians_geospace` (same without `asn_org_id`, for `summary_geospace_alltime`; its
  per-IP median spans ASNs, as the view's did). Update: the distinct (upload, ip) of the
  ingested days → copy those IPs' whole history from `tests` into a work table (one scan
  of `upload, ip`) → aggregate in shards of `cityHash64(ip)` (exact: every key has one IP)
  → insert with a new version. Then `summary_*alltime` are rebuilt from `ip_medians FINAL`
  in geospace shards and exchanged in, then `us_asns`. `-full` rebuilds ip_medians from
  all tests in geospace shards (key-pruned), into `ip_medians*_next`, switched with the
  summaries.
- Empty buckets: from ClickHouse 26.6 `REPLACE PARTITION` from a source without that
  partition fails (BAD_ARGUMENTS, verified on 26.8.24); the summarizer and the converter
  `DROP PARTITION` instead. `max_insert_threads` (default 1; 26.8 defaults it to the core
  count) and `async_insert=0` are set on every query.
- Exactness: `summarizer_test.go` writes every synthetic test both as one `tests` row and
  as one `measurements` row per geospace (built independently in Go: missing state/county,
  two counties, two tribal areas, unknown namespace, no geospace, IPv4 and IPv6) and checks
  all 13 tables against `testdata/legacy_views` on the `measurements` rows: after `-full`,
  after `-switch`, after an incremental update with IPs that have history, after a repaired
  day in an already summarized bucket, after an update with no tests, and after a second
  `-full`. Mutations caught: a threshold 25→26, per-IP RTT median from mbps, dropping the
  unknown-namespace pass, and an incremental all-time that ignores the IPs' history.
  Passes on ClickHouse 24.6 and 26.8.24 in ~10 s.

### Ingestor v3 — built (C)

- Writes one `tests` row per test; geospace columns from the reversegeocode file (US_STATES,
  US_COUNTIES, US_TRIBAL_TRACTS/US_AIANNH; others ignored). Tests with no geospace or no
  ASN org are dropped (as before). Decode errors now fail the run (they used to end the
  file silently); insert errors are returned instead of panicking; `async_insert=0`.
- Cursor `LastDate()` = `max(max_time)` of the active parts of `tests` in `system.parts`
  (exact, no scan). Tests at or before the cursor second are skipped.
- Summarizes only when the storage counted inserted rows.
- Completeness manifests (processor v2): from `INGEST_MANIFEST_FROM` (env, YYYY-MM-DD) on,
  a date is only ingested once `completeness/<date>*` exists, and the hourly service stops
  at the first date that isn't ready (its cursor is the newest test, so skipping a date
  would lose it). Unset = old behaviour (ingest when both geocode files exist).
- Repair: `ingest -repair D1,D2 [-replace] -summarize`. Without `-replace` the days' files
  are re-read and only ids missing from the day are added (ndt5/ndt7). With `-replace`
  (web100-era days, whose re-processed tests get new random ids) each affected month is
  copied without those days into `tests_repair_<YYYYMM>`, the files' tests are inserted
  into the copy, and the copy replaces the month partition; if another ingest wrote to the
  month meanwhile it refuses. All days' files must exist before anything is touched. Then
  `Summarize(first day, last day)`.
- `cmd/ingest -truncate` and the `measurements` writes are gone.
- Not done: the plan's "dry run on prod for one day into a scratch table" (no writes to
  production were allowed in this workstream); do it as runbook step 9.

### Processor v2 (`mlab-processor`) — built (workstream D, branch `ws-processor`)

What changed (all in `radar/mlab-processor`, tests green, `go vet` clean):

- **Fetch fails the date instead of uploading a partial day** (bugs 1, 8). Archive listings
  and tarballs are retried (3 attempts, 5 s backoff doubling, 30 min per attempt); a tarball
  that still fails aborts the date and nothing is uploaded. Each tarball is parsed into
  memory and written only when read completely, so retries never duplicate rows. A test
  file that is itself corrupt (bad JSON/snaplog inside a healthy tarball) is counted as
  `bad_files` and skipped, as before. Zero listed tarballs = failure. ndt7 JSON is decoded
  keeping only the last TCPInfo (rows identical to the old parser, unit-tested).
- **Storage** (bugs 2, 3, 7): only HEAD 404 means "not done"; other HEAD errors are retried
  4× and then fail the date. Uploads are synchronous, seek to 0 before every attempt
  (5 attempts) and return errors. Local storage writes atomically. Readers/writers close
  their files; truncated avro inputs are reported. Leftover `./output` temp files no longer
  count as done. S3 client moved from aws-sdk-go v1 (EOL) to aws-sdk-go-v2 with
  checksums "when required" (same wire behaviour as v1 towards B2); tested with httptest
  and a local MinIO, **not yet against B2** (no writes from dev machines).
- **Accounting**: one log line per date and step, e.g.
  `SUMMARY date=2026-07-31 step=fetch status=ok listed=14630 processed=14630 tests=6195321 bad_files=0 retries=0 seconds=452`
  (steps `check`, `fetch`, `ipgeocode`, `reversegeocode`, `date`; status ok/failed/skipped).
  When fetch + ipgeocode + reversegeocode all succeeded for a date, a manifest
  `completeness/<date>.json` is stored in the bucket (tarballs listed/processed per test
  type, tests, bad files, retries, per-step row counts). New B2 prefix `completeness/`
  (tiny JSON files; the ingestor ignores it). Upload order per date: `fetch/` right after
  the fetch, then `reversegeocode/`, then `ipgeocode/`, then the manifest (the ingestor
  takes a day once both geocode files exist). A fetch-only rerun deletes the manifest.
- **One-shot mode** (default of `mlab-processor`, for a systemd timer): checks dates
  today-2 back to today-9 and (re)processes a date, all steps from scratch, when it has no
  manifest or when M-Lab's archive now lists more tarballs than the manifest says were
  processed (late uploads). Exit status 1 if any date failed (→ systemd unit failed →
  alerting). Flags: `-end D`, `-from D` (catch-up start), `-recheck-days N` (default 7),
  `-check-only`, `-storage local|gcs|s3|b2`, `-workers N`, `-low-memory`, `-loop` (the old
  resident nightly loop over EARLIEST_DATE..today-2; the legacy unit template and the
  Dockerfile pass `-loop`). The geo data is loaded lazily and released after a run.
  **The current `/etc/systemd/system/mlab-processor.service` (no args, `Restart=on-failure`)
  must not be reused with the new binary as is**: use `Type=oneshot` + a daily timer (or add
  `-loop`). Suggested timer: daily 06:00 UTC, `TimeoutStartSec=6h`.
- `measurementlink` removed (step, model, CLI arg prints an error). Reverse geocoding loads
  only US_STATES, US_COUNTIES, US_AIANNH (US_TRIBAL_TRACTS allowed): ZIP_CODES and
  `TRACTS_SHAPE_DIR` are ignored with a log line, so the production env (which sets no
  shape paths) needs no change. Output for the kept namespaces is identical (verified).
  Points outside the US are not pre-filtered by a territory bounding box: the R-tree already
  rejects them at the root, so there is nothing to gain.
- `NetMap` replaced by per-prefix-length sorted integer tables (0 allocations per lookup,
  ~1000× faster in the micro-benchmark); a test compares it with the old implementation on
  the real GeoLite2 City and ASN CSVs (5.7 M + 1.1 M networks, ~4 M lookups: random,
  edges of networks, IPv4-mapped forms) — identical. Polygons store points by value.
- `ASN_IPV6_DB_PATH` config bug fixed (no production effect: processor_env sets no paths).
- web100 test ids are now UUIDv5(archive path + file name) instead of random v4, so a
  refetched web100 day has stable ids (ids of already ingested web100 days were random and
  cannot be matched; see Repairs).
- `scripts/refresh-geodata.sh ENV_FILE INPUT_DIR` (interface documented in its header):
  MaxMind GeoLite2-City-CSV / GeoLite2-ASN-CSV via basic auth (credentials passed to curl on
  stdin, never printed), sha256 verified, row-count sanity checks, atomic install of the
  four `*-Blocks-IPv{4,6}.csv` with one previous copy in `INPUT_DIR/previous/`, newest
  CAIDA `as-org2info.jsonl`, `INPUT_DIR/VERSIONS` (edition → release, sha256, CAIDA file).
  Idempotent: unchanged releases are skipped (only the small .sha256 is downloaded).
  Exit ≠ 0 on any failure, installed files untouched. Tested against a fake server.
- Build: `make -C mlab-processor binaries` → static `bin/mlab-processor`, `bin/process-mlab`
  (linux/amd64); `make test`. Go 1.25 (go.mod), Docker images golang:1.25-alpine / alpine:3.22.

Measured on jagular (16 threads, 27 GB) with 2026-07-31 (6,195,321 tests, production's
`fetch/2026-07-31.avro` and the server's current input files), local storage:

| Run | Peak RSS | Wall time |
|---|---|---|
| old binary, ipgeocode + reversegeocode (loads ZCTA + 56 tract files) | 6.4 GiB (6583 MiB) | 75 s (ipgeocode 32 s incl. 7 s load, reversegeocode 43 s incl. 15 s load) |
| v2, ipgeocode + reversegeocode | **1.0 GiB** (1000 MiB) | 33 s (ipgeocode 12 s incl. 3.3 s load, reversegeocode 21 s incl. 1.2 s load) |
| v2 one-shot end to end (fetch from M-Lab GCS + both steps) | 1.0 GiB (1008 MiB) | 487 s (fetch 452 s: 14,630 tarballs, 31 GB of ndt7 at ~65 MB/s) |

Outputs compared row by row: v2 ipgeocode = old ipgeocode (6,195,321 rows, 0 differences,
also for the freshly fetched day: same 6,195,321 tests as the file in B2); v2
reversegeocode = old reversegeocode minus the ZIP_CODES/CENSUS_TRACTS rows (2,465,389 rows,
0 differences; the old file had 2,456,068 more rows of dropped namespaces). The fetch is
network-bound (ndt7 is ~31 GB/day); on mapping-db expect similar or better. The 16 GB VM
target leaves ample room (≈1 GB peak).

How to run (on mapping-db, env from `processor_env`, working dir `/opt/broadbandmapping`):

- Daily: `mlab-processor` (one-shot; timer). Catch-up after the cutover:
  `mlab-processor -from 2026-08-01` (processes every date without a manifest up to today-2;
  ~8 min per day here, newest first). `mlab-processor -from D -check-only` lists decisions.
- **Short-day refetch** (repairs): `process-mlab -start D -end D -rerun -storage b2 all`
  (or a range with `-start D1 -end D2`); it refetches, regenerates both geocode files,
  uploads and writes the manifest; exit status 1 if a date failed (rerun it). Equivalent:
  `mlab-processor -from D1 -end D2` processes every date of the range that has no manifest
  (all pre-v2 dates). Then repair-ingest those dates (workstream C).
- Geo data: `scripts/refresh-geodata.sh /opt/broadbandmapping/processor_env /opt/broadbandmapping/input`
  monthly (timer, outside the processor's run window). TIGER shapes stay yearly/manual.

Open points for D:
- Not yet run against B2 (S3 client changed): first production run should be one date
  with `process-mlab -start D -end D -rerun -storage b2 all` and a look at the uploaded
  objects and `completeness/D.json`.
- The ingestor (C) should consider a day ready only when `completeness/<date>.json` exists
  (today it takes a day when both geocode files exist) and must handle re-uploaded days
  (repair mode).
- Days already ingested from web100 (2009–2019, e.g. the short days 2009-11-08,
  2010-02-01..02) have random ids; re-ingesting a refetched web100 day cannot skip "ids
  already present" — those days need replace-by-day instead.

### Repairs

Refetch the 59 short days with `process-mlab -start D -end D -rerun -storage b2 all` (v2
binary; ~8 min per day measured for 2026-07-31; see "Processor v2"), then the 2024-10..2025-06 range if the per-day cost allows, then repair-ingest
those days and run `summarize -from 2023-03-01` once.

### Ops

- ClickHouse upgrade 24.6 → current LTS before building `tests`: set `clickhouse_version`
  (currently `'latest'`, i.e. whatever was current at install time) to the pinned LTS in
  `radar-infra/ansible/roles/clickhouse/defaults/main.yml` or the playbook vars and run
  `make -C radar-infra/ansible setup-clickhouse` (role: AlexeySetevoi/ansible-clickhouse
  fork, apt install, `clickhouse_path_base: /mnt/clickhouse-data`, user `mapping`).
  Restart = summaries unavailable ~1 min; the API serves cached tiles for 5 min. Check the
  server config template in the role for memory settings before the VM downsize.
- Processor/ingestor/summarize are deployed by hand today (binaries copied into
  `/opt/broadbandmapping`, hand-written systemd units, env files): the new
  `roles/mlab-pipeline` replaces that.
- After the processor rework: VM 109 memory 32 → 16 GB (`qm set 109 --memory 16384`,
  cold restart), ClickHouse `max_server_memory_usage` accordingly, summarizer
  `MaxMemoryUsage` ≤ 10 GB.
- Backups: VM 109's data disk (scsi2 = `ztank/vm-109-disk-0`) stays out of PBS (user
  decision; everything in it can be rebuilt from B2). Safety net for the cutover: take a
  ZFS snapshot on proxymox-02 before the conversion (`zfs snapshot
  ztank/vm-109-disk-0@pre-tests-$(date +%F)`), keep it until `measurements` is dropped and
  the new pipeline has run for a few days, then destroy it (it pins the old blocks).
- Alerting: proxmox-02 postfix couldn't resolve its relay for days (73 sensor mails on
  hold: `postsuper -H ALL` releases); fix DNS, then alerts for ZFS state, PBS disk/backup
  failures, ingest freshness (newest `tests.time` older than 3 days), processor failures.
- Network: site DNS should point radar names at office LAN IPs (Tailscale-inside-Tailscale
  MTU blackhole; jagular has a temporary `/etc/hosts` entry for the registry); registry
  cert via DNS challenge in Traefik.
- Small: disable cloud-init on VMs 113/114 (`touch /etc/cloud/cloud-init.disabled`);
  fipsgeocoder compose bind path has a stray quote (`radar-infra/deploy/fipsgeocoder`);
  PBS verify job; ask Rafael why he stopped the processor on 2026-07-30 and about
  `resical`/`tic-parser` containers and `/mnt/clickhouse-data/backups/1.zip` (216 GB,
  2024) on mapping-db.

## Production validation of the processor (2026-10-11, release 555b5fc8)

Measured on mapping-db on a full real day (2026-10-07) during the catch-up, with the
ClickHouse conversion running on the same VM (`-workers 8 -download-workers 48`):

| Per day (31 GB of tarballs, ~6 M tests) | Original | Now |
|---|---|---|
| Fetch | 1,953 s (4 workers) | 318 s, 92–115 MB/s sustained, 48 connections, link-bound |
| ipgeocode | 29 s | 9 s |
| reversegeocode | 54 s | 4 s |
| Uploads | sequential PUTs | 38 s, multipart; B2 object sizes identical to the local files |
| Day total | ~33 min | 370 s |
| Peak memory (cgroup) | 6.4 GB (old geocoder) | 3.1 GB |
| ipgeocode file | 349 MB (null codec) | 211 MB (zstd) |

The earlier ~50 MB/s ceiling was Go's HTTP/2 transport multiplexing every download on
one TCP connection (receive-window / RTT bound); the fetcher now uses HTTP/1.1 with one
connection per download worker. CPU is no longer the limit: the 1 Gbps link is.

## Persistence rule (user requirement)

Every operational change that is a long-term fix must be codified so it is repeatable and,
where periodic, scheduled: Ansible in `radar-infra/ansible` (roles/playbooks, inventory
`production.yml`, hosts `radar-swarm-01`, `clickhouse-db`, `radar-db-01`) or a versioned
script in a repo with a systemd timer/cron. Nothing operational is done once by hand on a
box, except diagnosis and experiments. Where each change lives:

| Change | Home |
|---|---|
| ClickHouse version (upgrade from 24.6) and server settings (`max_server_memory_usage`, etc.) | `radar-infra/ansible/roles/clickhouse` (pinned version variable, config template), `playbooks/setup-clickhouse.yml` |
| Processor + ingestor + summarize deployment: binaries, systemd units/timers (processor one-shot nightly, ingestor hourly, geo refresh monthly, completeness re-check), env files (0600) from Ansible vault or the existing secrets mechanism, journald cap, `/opt/broadbandmapping` layout | new `roles/mlab-pipeline` + playbook; binaries built by a Makefile target in `radar/broadband_mapping/backend` and `radar/mlab-processor` |
| Geo data refresh (MaxMind CSVs + CAIDA, yearly TIGER) | script in `radar/mlab-processor/scripts/refresh-geodata.sh`, scheduled by the role's timer; the manual run of 2026-10-11 is the first execution of that script's logic |
| ClickHouse schema (`tests`, summaries, `ip_medians`) and conversion/backfill | `radar/broadband_mapping/backend/migrations/*.sql` + `cmd/` tools (`summarize`, `ingest`), runbook in this doc |
| B2 lifecycle rule, bucket policy | `radar-infra/scripts/b2/` (idempotent `b2 bucket update` script, run from the pipeline role or by hand with the same script) |
| Map API image + stack | existing `radar-infra/deploy/mapping-api` + Makefiles (`--provenance=false` already in `radar/server/Makefile`; mirror in `broadband_mapping/backend/Makefile`) |
| VM definitions on Proxmox (memory, `discard=on,ssd=1`, cloud-init disabled, fstab by UUID, guest agent) | `radar-infra` (new `proxmox/` playbook or scripts using `qm`), plus the VM template; today's manual `qm set` calls are to be re-expressed there |
| PBS prune/GC/verify schedule, retention | `radar-infra` (PBS job config as code: `proxmox-backup-manager` commands in a script or playbook) |
| Alerting (ZFS, PBS, backups, ingest freshness, processor failures), postfix relay fix on proxmox-02 | `roles/monitoring` (existing otel/vector setup) and a `proxmox` playbook |
| DB-side fixes on radar-db-01 (swap by UUID, etc.) | `roles/postgresql` / cloud-init template |

## Workstreams (parallelizable)

| # | Workstream | Depends on | Deliverable / acceptance |
|---|---|---|---|
| A | **Schema + conversion**: `tests` DDL (measure id split vs plain ZSTD on a 1-day sample first), conversion `INSERT INTO tests SELECT ... FROM measurements` collapsing the 2–3 rows per id into one (group by id; state/county/tribal from the rows' geospace namespaces via `geospaces`), run in month chunks with `max_threads ≤ 6`; verify row count = distinct ids, per-month counts, and per-geospace counts equal the old table. | ClickHouse upgrade (G) first if doing it | **Code done** (branch `ws-backend`): DDL in `migrations/004_tests.sql`, `cmd/convert_measurements` (year chunks, not month: see runbook). Prod run pending: runbook steps 1–5 |
| B | **Summarizer v3 + ip_medians** in `summarizer.go` (+ `-windows`, `-full`, `-switch` kept), exactness tests extended (3 geospace columns, incremental all-time vs full). | Schema contract above (not A's data) | **Code done** (`ws-backend`), tests green on 24.6 and 26.8; prod: runbook steps 6–8 (`-validate-before` checks pre-2025 periods) |
| C | **Ingestor v3** writing `tests`, repair mode, `LastDate` from parts, mocks regenerated. | Schema contract | **Code done** (`ws-backend`), tests green; prod dry run = runbook step 9, deploy = step 10 |
| D | **Processor v2** (bugs 1–3, 7; measurementlink removed; shapes trimmed; completeness record; one-shot timer; mmdb lookup). | none | `go test`; one real day processed end to end with the listed/processed numbers logged; memory peak measured (`systemd-run -p MemoryMax` or /proc) |
| E | **Repairs**: refetch short days, repair-ingest, re-summarize. | C, D deployed | Row counts of the 59 days ≥ 80 % of their month's median |
| F | **API + frontend**: close rows; tiles cache + Cache-Control; LastDate; frontend month/year bugs; `TestAPI` fixed. | none | tests green; image built with `--provenance=false`, deployed via `radar-infra/deploy` Makefile |
| G | **Ops**: ClickHouse upgrade; VM memory; backups; alerting; DNS/MTU; registry cert; cloud-init; fipsgeocoder; PBS verify; B2 purge verification (`b2 ls --versions` counts after a day). | VM memory after D | each item verified on the host |

Suggested parallel assignment: A, B, C, D, F, G start at once (B and C code against the
schema in this document; A owns the DDL and must publish any deviation to B and C
immediately). E runs after C and D are deployed.

## Production runbook: conversion, summaries, ingestor (A–C)

Code: branch `ws-backend` (on top of `mapping-incremental-summaries`), module
`broadband_mapping/backend`. Tools:

| Binary (`make pipeline-binaries` → `dist/`) | Use |
|---|---|
| `convert_measurements -from YYYY-MM -to YYYY-MM [-verify] [-redo] [-strategy join\|groupby] [-chunk-months 12] [-max-threads 6] [-max-insert-threads 1] [-max-memory B] [-spill-bytes B] [-classify-shard-rows N]` | Fill `tests` from `measurements`. Reads `measurements` in aligned chunks of months (default calendar years), collapses them into `tests_conv_staging` (`-strategy join`, the default: a test with exactly one county row and one state row that is the county's `parent_id` (~98 % of production) is taken from its county row, read by primary key; a classification `GROUP BY id` with a 32-byte state, per month in hash shards sized to 60 % of `-max-memory`, lists the other ids exactly, and those go through the full `GROUP BY id` of `-strategy groupby`, which collapses every row and spills past `-spill-bytes`; both strategies give byte-identical rows, checked by `TestConverterStrategiesAgree`), then per month `REPLACE PARTITION` (or `DROP PARTITION` when the month has no tests) and a row in `tests_conversion_log`. Re-running skips logged months (resume); `-redo` converts them again. `-verify` compares per month distinct ids in `measurements` (cityHash64 of id) with rows and distinct ids of `tests`, and per (month, geospace) distinct ids with `tests`' (test, geospace) pairs; duplicate (id, geospace) rows of `measurements` are reported (the old summaries counted them twice; `tests` keeps one); exits 1 on any DIFF. |
| `summarize -full / -validate-before YYYY-MM-DD / -switch / -from D [-to D]` plus `-windows`, `-max-threads`, `-max-memory`, `-spill-bytes`, `-max-insert-threads`, `-parallel`, `-shard-rows` | `-full` builds all summaries and `ip_medians*` into `*_next`; `-validate-before` compares `*_next` with the live tables for buckets that ended before the date (year, quarter, month, week, both variants; semester and all-time skipped), exit 1 on differences; `-switch` exchanges, keeping `*_old`. |
| `ingest -start D -end D` / `ingest -repair D1,D2 [-replace] [-summarize]` | Backfill / repair (see Ingestor v3). |
| `mlab-ingestor` (cmd/ingestor_service) | Hourly service; env `INGEST_MANIFEST_FROM`. |

Why year chunks: `measurements` is unpartitioned and its 15 parts span years (two parts of
3.95 B and 3.28 B rows). EXPLAIN on production: reading every month separately selects
15.2 M granules in total (13× the table's 1.18 M); every year separately 2.28 M (1.94×).

### Measured locally (ClickHouse 26.8.24, 16-core desktop) and estimates for mapping-db

| Step | Local measurement | Production estimate (10 cores, `-max-threads 6`) |
|---|---|---|
| Conversion | 27.7 M `measurements` rows (production sample ×10) in 42 s with `-max-memory 3e9 -spill-bytes 1e9` (spilling, peak 1.71 GiB) = 0.67 M rows/s | 9.4 B rows × 1.94 read amplification: **4–6 h**; peak memory ≤ `-max-memory`; temp disk: one year's staging (≤ ~15 GiB) + GROUP BY spill |
| Conversion, `-strategy join` (2026-10-11) | 32.1 M synthetic rows (16 M tests, 1.8 % exceptions) in 17.9 s vs 38.1 s with `groupby` (`-max-threads 6 -max-memory 5e9 -spill-bytes 7e8`, 1 insert thread); 11.8 s vs 33.1 s with `-max-insert-threads 2`. Of the 17.9 s, ~12 s is the INSERT into `tests` (sort + ZSTD(3)); the county-row read takes 0.6 s, classification 0.5 s per month, the exceptions' GROUP BY 1.8 s. Production ran `groupby` at ~0.33 M rows/s (2009–2017). | 2.1–2.8× faster than `groupby`; classification memory = 125 B per source row of a shard (≤ 60 % of `-max-memory`), the exceptions' GROUP BY ~2 % of the old one's |
| `tests` size | 23.6–30.8 B/test | **~105 GiB** (4.65 B tests) |
| Verify | 27.7 M rows in 2 s (no spill) | two `GROUP BY` scans of `measurements` (`time, id, geospace_id`) per chunk + `tests`: **1–2 h** |
| `summarize -full` v3 (measured on production 2019 after the fact) | one month bucket, both variants: 25 s / 42 CPU-s / 2.2 GiB; week buckets read 83 % of their month | month ~70 min, week ~140 min, year/semester/quarter ~60 min each, all-time ~45 min: **5–7 h** |
| `summarize -full` v4 (2026-10-11, `backend/docs/incremental-summaries.md`) | 2019 month window: per-IP rows of every pass and variant in 31 s wall / 56 CPU-s (6 streaming shard queries, 4 at a time, ≤ 1.4 GiB each) vs 300 s / 500 CPU-s for v3; local 24 M synthetic tests: 2 min 37 s vs 4 min 36 s, identical tables | 6 streaming passes of ~11 min at `-parallel 4` plus scans, outer aggregations and ip_medians: **1.5–2 h**; memory ≤ `-parallel` × 1.3 GiB (shards) |
| Daily update (one new day) | 6 s on the sample | the current year's chunk (~1 min per 400 M tests) + smaller windows + the unchanged all-time update: **10–15 min** |

Unknown until the first `-full`: the size of `ip_medians` (one row per geospace × ASN ×
upload × IP over all history; the plan guessed 100–300 M rows, it may be over 1 B). Check
`SELECT table, sum(rows), formatReadableSize(sum(bytes_on_disk)) FROM system.parts WHERE
active AND table LIKE 'ip_medians%' GROUP BY table` afterwards; if the daily all-time
rebuild from it is too slow, rebuild only the touched geospaces' rows.

### Steps (mapping-db, as root; ClickHouse already on 26.8 LTS, ingestor and processor stopped)

Long jobs run as transient systemd units so they survive SSH drops; poll them with
`journalctl -u <unit> -n 5 --no-pager` and `systemctl is-active <unit>` (≤ 60 s checks).

0. Build and install (until `roles/mlab-pipeline` does this):
   `make -C broadband_mapping/backend pipeline-binaries` on a dev box, then
   `scp dist/{mlab-ingestor,ingest,summarize,convert_measurements} clickhouse-db:/tmp/` and
   `sudo install -m 0755 /tmp/mlab-ingestor /opt/broadbandmapping/mlab-ingestor-v3`,
   `.../ingest /opt/broadbandmapping/ingest-v3`, `.../summarize /opt/broadbandmapping/summarize-v3`,
   `.../convert_measurements /opt/broadbandmapping/convert_measurements`. The old
   `mlab-ingestor` and `summarize` stay for rollback.
1. Snapshot (ops, on proxmox-02): `zfs snapshot ztank/vm-109-disk-0@pre-tests-$(date +%F)`.
2. Check space: `df -h /mnt/clickhouse-data` (≥ 300 GB free; 906 GB on 2026-10-11).
3. Create `tests`:
   `bash -c 'set -a; . /opt/broadbandmapping/ingestor_env; set +a; CLICKHOUSE_PASSWORD="$DB_PASSWORD" clickhouse-client --host "$DB_HOST" --port "$DB_PORT" --user "$DB_USER" --database "$DB_NAME" --multiquery' < migrations/004_tests.sql`
   (copy the file over first; don't use `scripts/migrate.sh`, it echoes the password).
4. Convert (resumable; re-run the same command after any failure):
   `systemd-run --unit=convert-measurements -p EnvironmentFile=/opt/broadbandmapping/ingestor_env /opt/broadbandmapping/convert_measurements -from 2009-01 -to 2026-08 -max-threads 6 -max-memory 16000000000 -spill-bytes 6000000000`
   Progress: one `converter: YYYY-MM: N tests` line per month, `tests_conversion_log`.
   A month can be redone alone: `... -from 2025-03 -to 2025-03 -redo`.
5. Verify: `systemd-run --unit=verify-tests -p EnvironmentFile=/opt/broadbandmapping/ingestor_env /opt/broadbandmapping/convert_measurements -from 2009-01 -to 2026-08 -verify -max-threads 6 -max-memory 16000000000 -spill-bytes 6000000000`
   → must end with `0 differ` (exit 0). Then check the size:
   `SELECT formatReadableSize(sum(bytes_on_disk)), sum(rows) FROM system.parts WHERE active AND table = 'tests'`.
6. Summaries into `*_next` (the live tables keep serving):
   `systemd-run --unit=summarize-full -p EnvironmentFile=/opt/broadbandmapping/ingestor_env /opt/broadbandmapping/summarize-v3 -full -max-threads 6 -max-memory 16000000000 -parallel 1`
7. Validate against the live tables (built by the old views on 2025-06-09 from the same
   tests): `summarize-v3 -validate-before 2025-06-01` (same env). Expected: OK for year,
   quarter, month and week up to 2025-05. Semester (fixed halves) and all-time (newer data)
   are skipped by design. Possible legitimate DIFFs, to inspect before switching: buckets
   with duplicate (id, geospace) rows (reported by step 5's verify), and IPs whose string
   forms differ but are the same address (`1.2.3.4` vs `::ffff:1.2.3.4`), which `tests`
   (IPv6 column) merges. Spot-check a DIFF bucket with
   `SELECT * FROM summary_month WHERE (year, month) = (Y, M) EXCEPT SELECT * FROM summary_month_next WHERE (year, month) = (Y, M) LIMIT 10`.
8. Switch: `summarize-v3 -switch` (drops leftover `*_tmp` views, exchanges the 13 tables
   and `ip_medians*`, keeps `*_old`). Check the map (counties, a state, an ASN filter,
   2026 months now present).
9. Ingestor dry run (C's acceptance, optional): in a scratch database with the 4
   migrations and a copy of `geospaces`/`asn_orgs`, run
   `ingest-v3 -start 2026-07-31 -end 2026-08-01` with `DB_NAME=<scratch>` and compare
   `SELECT count() FROM tests` with `tests` in `mlab-mapping` for that day.
10. Deploy the ingestor: point `/etc/systemd/system/mlab-ingestor.service` `ExecStart` at
    `/opt/broadbandmapping/mlab-ingestor-v3`, add `INGEST_MANIFEST_FROM=<first date processor
    v2 uploads, e.g. 2026-08-01>` to `ingestor_env`, `systemctl daemon-reload`, enable and
    start; first run's log: `Requesting insertions from 2026-08-01 ...`, then
    `inserted N tests` and the summarizer lines. The cursor starts at the newest converted
    test (2026-08-01, a partial day): after processor v2 re-uploads 2026-08-01, run
    `ingest-v3 -repair 2026-08-01 -summarize` (ndt ids: add missing).
11. Repairs (E): ndt-era days `ingest-v3 -repair D1,D2,... -summarize`; web100-era days
    (before 2019-07) `ingest-v3 -repair D -replace -summarize`. Stop the hourly ingestor
    while repairing the month it is writing to (a replace refuses otherwise).

Rollback: `summarize-v3 -switch` is reversible by exchanging `<t>_old` back
(`EXCHANGE TABLES <t>_old AND <t>` for each of the 13 tables); the old ingestor binary
still writes `measurements`, which is untouched by all of the above.

## As run on mapping-db (2026-10-11/12)

Binaries come from `roles/mlab-pipeline` releases (`/opt/broadbandmapping/releases/<sha>`,
`current` symlink), not the step-0 scp: release 8adf40a2 ran the conversion, 3cd82325
(summarizer v4, same processor binary) is `current` for everything after it.

| Step | Result |
|---|---|
| Conversion, `-strategy join -chunk-months 12 -max-threads 6 -max-insert-threads 2 -max-memory 14e9 -spill-bytes 6e9` | **1 h 54 min** for 2009-01..2026-08 (the plan estimated 4–6 h for `groupby`; the first `groupby` attempt spilled 34 GB on 2017 and was stopped). Per year: 2018 7.6 min, 2019 4.7, 2020 8.4, 2021 21.2, 2022 25.6, 2023 20.5, 2024 13.2, 2025 8.8, 2026 (8 months) 4.4. 2021–2023 ran while the catch-up fetch used the same cores. 0.4–0.5 % of ids go through the GROUP BY. |
| `tests` size | **93.4 GiB, 4.68 B rows** (21.4 B/test) vs `measurements` 379.8 GiB, 9.40 B rows. |
| `summarize -full` v4, first run (21:57) | all-time window 1 h 1 min: per-IP pass 23 min (135 shards, catch-up fetch on the same cores), 1.23 B tests (26 %) on the per-geospace path: 56 min for the chunk with the hash-sharded geo step (~100 scans), ip_medians 1.50 B / 1.49 B rows. Stopped at the year window, geo step rewritten as one streaming ARRAY JOIN query per variant (763d7fed). |
| `summarize -full -windows year,semester,quarter,month,week`, release 763d7fed (23:17, catch-up stopped) | **1 h 26 min** for the five windows; per-year chunks have almost no split IPs (2015: 27 k tests on the geo path). |
| `summarize -validate-before 2025-06-01` | 8 tables DIFF. 2018: identical. 2022: 0.3 % of rows with small median/band changes (duplicate (id, geospace) rows of the old ingest cursor, collapsed in `tests`). 2019: 40 k per-ASN rows only live: every one made of measurements rows with id `ERROR_DISCOVERING_UUID` (the first processor's id for tests whose UUID it could not read; 181,959 rows, 2,073 IPs, all in 2019), which the conversion collapsed into one test per month. Verify did not see it: it counted distinct ids on both sides. Fix: `testKey` (content hash for that id) in the conversion and verify, `convert_measurements -repair-unknown-ids` (release after 763d7fed), then a second `-full`. |
| `convert_measurements -repair-unknown-ids -from 2019-01 -to 2019-12` (release dbf9c1b7) | 2 min 9 s: 181,959 rows are 2,166 tests (each spread over ~70 geospaces: 127.0.0.1-style IPs, 0 Mbps, junk the old views counted too). Verify of 2019 with the content key: 12 months OK. |
| `summarize -full`, second run (07:23, no catch-up, geo fix) | **2 h 16 min** all windows: all-time per-IP pass 14 min (was 23), ip_medians 49 min, the five windows ~1 h 28 min. |
| `summarize -validate-before 2025-06-01`, second run | DIFF in the 8 windowed tables, symmetric (same groups, changed values): year 6,405 of 1.96 M rows (0.3 %), from the old table's duplicate rows; 2018 identical. Accepted. |
| `summarize -switch` | 09:42:22, 78 ms. API: Roanoke 2024 / 2024-06 and Virginia 2024 identical to the pre-cutover baselines; 2026 and all-time now through 2026-08. |
| Ingestor enabled (role, `INGEST_MANIFEST_FROM=2026-08-01`, processor timer off during the catch-up) | 09:43: first run inserted 1,062,090 tests (the rest of 2026-08-01), then the incremental summaries: **12 min 20 s** for the day (ingest 11 s; all-time per-IP update of the day's IPs 420 M (test, geospace) rows in 4 min 43 s, the two all-time summaries 2 min 22 s + 2 min 4 s, year 2 min 7 s, semester and quarter 20 s each, month 1 s, week 8 s), with the catch-up fetch sharing the cores. Within the 10–15 min acceptance. Catch-up `mlab-catchup` relaunched 09:44 for 2026-08-02..09-08, newest first. |
| Ingestor range run over the 70 catch-up days (2026-10-12 afternoon) | Three bugs, all fixed on master and deployed through the role: cut B2 downloads crashed the run (avro truncated block; 15 restarts) → `s3storage` resumes with a Range request (d6586892); store workers spun forever draining a failed iterator (c9a670b1); the ClickHouse pool of nWorkers + 5 timed out ("acquire conn timeout") with 10 days × 8 inserters, which silently truncated every day 2026-08-02..10-05 to 10–500 k tests → inserts of all days share 16 slots, pool sized from that (088bc66f; the first fix, a pool of 95, hit the server's simultaneous-query limit, code 202). |
| `ingest -repair <65 days> -summarize` (release 088bc66f, 20:08) | 50 min 36 s: 28 min of reading and additive inserts, then the summaries of 2026-08-02..10-05 in 29 min 20 s (all-time per-IP update of 1.47 B (test, geospace) rows in 17 min). Every day 2026-08-01..10-10 is now 0.99–1.34 M tests (weekends ~1.0 M). API: Roanoke 2026-09 and 2026-10, Virginia 2026-09 populated. |
| Short days: `/root/mlab-short-days.sh 8` (unit `mlab-short-days`, 15:42–22:21) | 59 of 59 refetched, listed = processed for every day (2023-03-01: 30,142 tarballs, 9.0 M tests; 2025-02-05: 16,150, 10.3 M); 5–9 min per day at the link's ~114 MB/s. |
| `ingest -repair <59 days> -replace` (22:22) | 35 min 43 s; the days now hold 0.8 k (2009-11-08) to 2.99 M (2023-03-01) US tests. |
| `summarize -full`, third run (22:58, nothing else on the box) | **2 h 42 min** through 2026-10-11 (the all-time pass now covers 4.9 B tests). |
| `summarize -validate-before 2026-10-01` | unchanged years identical (2015, 2021 checked row for row); 2023 and the other repaired years gained rows (2023: 29 k new per-ASN rows, 36 k sample counts changed). |
| `summarize -switch` | 2026-10-13 01:43. API: Roanoke 2024 29,155 samples (28,293 before the 2024 short days), 2023-03 and 2026-09 populated. Processor timer re-enabled through the role (`Persistent=true` fired the missed 06:00 UTC run at once, for 2026-10-11). First unattended cycle: processor 297 s for the day, ingestor's hourly run inserted 961,481 tests and updated the summaries in **9 min 23 s** (ip_medians 3 min, idle box). |
| Verify | 2009-01..2017-12 (108 months) all OK, 2017 alone took ~8 min; stopped at 21:59 on the user's call: the `-validate-before` comparison of the new summaries against the live ones covers every year end to end, so the row-level pass over 2018+ was not worth ~1 h of cores. |

## Cutover runbook (after A–D are ready)

1. Ingestor and processor stay stopped. `tests` converted and verified (A; steps 0–5 of
   the production runbook above).
2. `summarize -full` from `tests` into `*_next` (B); validate vs live tables; `-switch`
   (steps 6–8).
   Map now shows data to 2026-08-01 (summaries were stuck at 2025-06-09).
3. Deploy ingestor v3 and processor v2 binaries (`install` into `/opt/broadbandmapping`,
   systemd units updated to the new binaries/timer), enable and start the ingestor, then
   the processor for the 2026-08-01..today catch-up; watch memory and the per-date
   completeness lines.
4. Repairs (E). 5. Drop `measurements` and the `_old` summary tables when the user agrees.
6. VM downsize, backups, alerting (G).

Rollback at any step: the old tables are untouched until step 5; the old binaries stay in
`/opt/broadbandmapping` (`mlab-ingestor`, `mlab-processor`, `summarize`).

## Decisions still needed from the user

- Delete `fetch/` from B2 (274 GB) too?

Decided: US-only `tests` (no-US tests dropped as today); own geocoder only, no M-Lab BigQuery; no PBS backup of the ClickHouse disk, a
temporary ZFS snapshot before the cutover instead; Float64 metrics; exact medians
(confirmed by the user: t-digest per-IP medians differed from exact by 11% on average and
changed band counts in 37% of county×ISP groups on a real month; small groups are common
at both median levels, so approximate quantiles are out — speed work targets query
structure only).
