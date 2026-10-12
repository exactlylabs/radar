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
- `pkg/app/webapi` `TestAPI` fails on master (mock expectation; pre-existing).

Frontend: "Last month" sends `month=11` in January (`filters.ts:170-174`); year list stops
at 2025 (`filters.ts:79`).

## Target design

### `tests` table (ClickHouse, replaces `measurements`)

One row per test. All fields kept (test-level analysis is a goal), Float64 metrics.

```sql
CREATE TABLE tests (
  day            Date MATERIALIZED toDate(time),
  time           DateTime('UTC') CODEC(Delta, ZSTD(3)),
  id_prefix      LowCardinality(String),      -- "ndt-xfwjw" part of the M-Lab id
  id_ts          UInt32 CODEC(Delta, ZSTD(3)),-- unix seconds part
  id_seq         UInt64 CODEC(Delta, ZSTD(3)),-- hex counter part
  -- id = concat(id_prefix, '_', toString(id_ts), '_', hex zero-padded to 16 of id_seq)
  test_style     LowCardinality(String),
  ip             IPv6,                        -- IPv4 mapped (::ffff:a.b.c.d)
  upload         Bool,
  mbps           Float64,
  min_rtt        Float64,
  loss_rate      Float64 CODEC(ZSTD(3)),
  latitude       Float64 CODEC(ZSTD(3)),
  longitude      Float64 CODEC(ZSTD(3)),
  location_accuracy_km Float64 CODEC(ZSTD(3)),
  has_access_token Bool,
  asn_org_id     UUID,
  state_id       Nullable(UUID),
  county_id      Nullable(UUID),
  tribal_id      Nullable(UUID),
  INDEX ip_bf ip TYPE bloom_filter GRANULARITY 4
) ENGINE = MergeTree
PARTITION BY toYYYYMM(time)
ORDER BY (upload, county_id, asn_org_id, ip, time)
SETTINGS index_granularity = 8192, allow_nullable_key = 1;
```

Notes: verify the id format on real data before fixing the split (observed:
`ndt-xfwjw_1783004604_000000000016D11D`; ndt5/web100 ids may differ — if a format doesn't
fit, keep a plain `id String CODEC(ZSTD(3))` instead; measure both). Geospace columns are
explicit so edge cases (county without state etc.) are preserved exactly. Expected size
~90 GB. Decide (user): keep non-US tests (no geospace) — today they're dropped.

### Summaries (`summarizer.go` v3)

Same 13 output tables as today. For each window and variant, three passes over `tests`
(state, county, tribal) grouping by the respective geospace column, union into the same
`summary_*` tables. Buckets recompute as today (partition pruning now by `toYYYYMM`).

All-time becomes incremental: a table `ip_medians (upload, geospace_id, asn_org_id, ip,
med_mbps Float64, med_rtt Float64, n UInt64) ENGINE = ReplacingMergeTree ORDER BY
(upload, geospace_id, asn_org_id, ip)` holds the per-IP all-time medians (one row per
geospace the IP belongs to). Daily update: for the (geospace, asn, upload, ip) keys seen in
the ingested days (≈ 1 % of history), recompute their exact medians from `tests` (primary
key `county_id, asn_org_id, ip` makes that a key lookup; for state rows use the bloom
filter on `ip` or a state→counties expansion), upsert into `ip_medians`, then rebuild
`summary_alltime` / `summary_geospace_alltime` from `ip_medians` (~100–300 M rows, one
`quantileExact` pass, minutes). Full rebuild of `ip_medians` = the old all-time inner
query, sharded as today. Keep the exactness test: new summaries must equal the legacy view
SQL (with the semester fix) on synthetic data, and on production the pre-2025 periods must
equal the current live tables.

### Ingestor v3

Writes `tests` (one row per test; geospace columns from the reversegeocode file).
Cursor = `max(time)` from `system.parts` of `tests`. Summarize only when new rows were
inserted (already done). Add a repair mode: `cmd/ingest -dates D1,D2,... -replace` that
re-ingests given days by writing them to a staging table and `REPLACE PARTITION`-ing is
wrong for partial months — instead: delete-by-id is impossible cheaply, so repair =
re-ingest the day's file skipping ids already present (load that day's ids: one partition,
cheap) and then `summarize -from D -to D`. Also fix `LastDate`.

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
| A | **Schema + conversion**: `tests` DDL (measure id split vs plain ZSTD on a 1-day sample first), conversion `INSERT INTO tests SELECT ... FROM measurements` collapsing the 2–3 rows per id into one (group by id; state/county/tribal from the rows' geospace namespaces via `geospaces`), run in month chunks with `max_threads ≤ 6`; verify row count = distinct ids, per-month counts, and per-geospace counts equal the old table. | ClickHouse upgrade (G) first if doing it | `tests` populated, counts verified, DDL in `migrations/004_tests.sql`, conversion script in `scripts/` |
| B | **Summarizer v3 + ip_medians** in `summarizer.go` (+ `-windows`, `-full`, `-switch` kept), exactness tests extended (3 geospace columns, incremental all-time vs full). | Schema contract above (not A's data) | `go test` green on local ClickHouse; then on prod: `summarize -full` from `tests`, pre-2025 periods equal live tables, switch |
| C | **Ingestor v3** writing `tests`, repair mode, `LastDate` from parts, mocks regenerated. | Schema contract | Unit tests; dry run on prod for one day into a scratch table |
| D | **Processor v2** (bugs 1–3, 7; measurementlink removed; shapes trimmed; completeness record; one-shot timer; mmdb lookup). | none | `go test`; one real day processed end to end with the listed/processed numbers logged; memory peak measured (`systemd-run -p MemoryMax` or /proc) |
| E | **Repairs**: refetch short days, repair-ingest, re-summarize. | C, D deployed | Row counts of the 59 days ≥ 80 % of their month's median |
| F | **API + frontend**: close rows; tiles cache + Cache-Control; LastDate; frontend month/year bugs; `TestAPI` fixed. | none | tests green; image built with `--provenance=false`, deployed via `radar-infra/deploy` Makefile |
| G | **Ops**: ClickHouse upgrade; VM memory; backups; alerting; DNS/MTU; registry cert; cloud-init; fipsgeocoder; PBS verify; B2 purge verification (`b2 ls --versions` counts after a day). | VM memory after D | each item verified on the host |

Suggested parallel assignment: A, B, C, D, F, G start at once (B and C code against the
schema in this document; A owns the DDL and must publish any deviation to B and C
immediately). E runs after C and D are deployed.

## Cutover runbook (after A–D are ready)

1. Ingestor and processor stay stopped. `tests` converted and verified (A).
2. `summarize -full` from `tests` into `*_next` (B); validate vs live tables; `-switch`.
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

- Keep non-US tests in `tests`? Measured on 2026-07-31's files: 6.20 M tests worldwide,
  1.30 M (21 %) match a US state/county. US-only `tests` ≈ 4.7 B rows ≈ 90 GB; with
  non-US ≈ 22 B rows ≈ 420 GB. Non-US tests have no geospace, so they only serve
  test-level analysis. Option: keep non-US only from a recent date (~2 GB/month).
- Delete `fetch/` from B2 (274 GB) too?

Decided: own geocoder only, no M-Lab BigQuery; no PBS backup of the ClickHouse disk, a
temporary ZFS snapshot before the cutover instead; Float64 metrics; exact medians.
