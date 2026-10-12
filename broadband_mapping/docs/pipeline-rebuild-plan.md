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

### Processor v2 (`mlab-processor`)

- Fix bugs 1–3, 7: fetch errors fail the date (retry a tarball 3×, then abort the date,
  never upload); only HEAD 404 means "not done"; seek to 0 before upload retry; close
  files. Record per date: tarballs listed, tarballs processed, tests written; refuse to
  mark done when listed ≠ processed. Log a one-line summary per date.
- Remove the `measurementlink` step and the `fetch/` upload? No: keep uploading `fetch/`
  (raw retention) unless the user says otherwise; remove `measurementlink`.
- Drop ZCTA and tract shapes from the reverse geocoder config (`SHAPE_PATHS`,
  `TRACTS_SHAPE_DIR`); free shapes and netmaps after a run or run as a one-shot
  (systemd timer nightly) instead of a resident loop.
- Replace `NetMap` with a MaxMind mmdb reader or a radix trie over the same CSVs. The
  geocoder loads the CSVs by header name (`ipgeocoder/geocode.go:52,107`), so MaxMind's
  CSV editions are a stable input.
- Geo data: refreshed on 2026-10-11 to GeoLite2-City-CSV_20261009, GeoLite2-ASN-CSV_20261010
  and CAIDA 20261001 (previous Sep-2024 files kept in `input/backup-20240925/`). MaxMind
  account id + license key are in `/opt/broadbandmapping/processor_env`
  (`MAXMIND_ACCOUNT_ID`, `MAXMIND_LICENSE_KEY`; file is root 0600). Add a monthly refresh
  (systemd timer) doing: download `https://download.maxmind.com/geoip/databases/<edition>/download?suffix=zip`
  with basic auth, verify `.sha256`, unzip, copy the four `*-Blocks-IPv{4,6}.csv`, fetch the
  newest `publicdata.caida.org/datasets/as-organizations/YYYYMMDD.as-org2info.jsonl.gz`.
  TIGER shapes (`tl_us_*.zip`) are from Sep 2024; refresh yearly.
- Bug: `pkg/app/config/spec.go:15` binds `AsnIpv6DBPath` to the `ASN_IPV4_DB_PATH` key.
- Geocoding stays ours (GeoLite/CAIDA IP geocoding + TIGER reverse geocoding); M-Lab's
  BigQuery geolocation is not used (user decision). Completeness therefore comes from our
  own accounting: tarballs listed vs processed per date, tests written, and a 7-day
  re-check.
- Decide (user): keep non-US tests (see "Decisions").
- Daily schedule: run for `today-2` and re-check the last 7 days' completeness every run.

### Repairs

Refetch the 59 short days with `process-mlab -start D -end D -rerun -storage b2` (time one
day first), then the 2024-10..2025-06 range if the per-day cost allows, then repair-ingest
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
| `convert_measurements -from YYYY-MM -to YYYY-MM [-verify] [-redo] [-chunk-months 12] [-max-threads 6] [-max-insert-threads 1] [-max-memory B] [-spill-bytes B]` | Fill `tests` from `measurements`. Reads `measurements` in aligned chunks of months (default calendar years), collapses with `GROUP BY id` (spills past `-spill-bytes`) into `tests_conv_staging`, then per month `REPLACE PARTITION` (or `DROP PARTITION` when the month has no tests) and a row in `tests_conversion_log`. Re-running skips logged months (resume); `-redo` converts them again. `-verify` compares per month distinct ids in `measurements` (cityHash64 of id) with rows and distinct ids of `tests`, and per (month, geospace) distinct ids with `tests`' (test, geospace) pairs; duplicate (id, geospace) rows of `measurements` are reported (the old summaries counted them twice; `tests` keeps one); exits 1 on any DIFF. |
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
| `tests` size | 23.6–30.8 B/test | **~105 GiB** (4.65 B tests) |
| Verify | 27.7 M rows in 2 s (no spill) | two `GROUP BY` scans of `measurements` (`time, id, geospace_id`) per chunk + `tests`: **1–2 h** |
| `summarize -full` ip_medians | 28 M (test, geospace) rows in 3.4 s ≈ 8 M rows/s | 9.4 B rows: **30–60 min** |
| `summarize -full` buckets | (old table on prod: one month, both variants, 15 s) | 5 bucketed windows ≈ 5 table reads + ~1,300 buckets × 2 variants of overhead: **1.5–2.5 h** with `-parallel 1`, about half with `-parallel 2` (memory ×2) |
| Daily update (one new day) | 6 s on the sample | one scan of `tests(upload, ip)` + ip_medians rebuild of summary_*alltime + the touched year/semester/quarter/month/week buckets: **15–25 min** |

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
temporary ZFS snapshot before the cutover instead; Float64 metrics; exact medians.
