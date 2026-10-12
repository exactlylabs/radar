-- One row per M-Lab test. Replaces `measurements`, which stored each test once per matching
-- geospace (2-3 rows per test id). Nothing in the map API reads this table: summarize builds the
-- summary_* tables and ip_medians from it.
--
-- Geospaces: state_id / county_id / tribal_id hold the test's geospace of each namespace
-- (NULL when it has none: e.g. no tribal area, or a county without a state). A test can match
-- more than one geospace of a namespace: about 0.2% of tests fall in two counties (Virginia
-- independent cities and their surrounding county, e.g. Roanoke + Salem; also Arapahoe + Denver CO), and a
-- tribal tract and an AIANNH area both map to tribal_tracts. The smallest id of each namespace is
-- the primary column, the others go to extra_geospace_ids, so every (test, geospace) pair of the
-- old table is kept and summaries stay identical. Geospaces of an unknown namespace also go to
-- extra_geospace_ids.
--
-- id: M-Lab ids are `<prefix>_<unix seconds>_<16 hex digits>` for ndt5/ndt7
-- (ndt-xfwjw_1783004604_000000000016D11D, also ndt-virtual-xxxxx_...) and random UUIDs for the
-- web100 era (2009-2019). Measured on two production days (2019-06-01, 978,188 tests; part of
-- 2026-07-15, 595,786 tests) in this table's sort order:
--   plain String CODEC(ZSTD(3)):          18.85 B/test (web100), 5.38 B/test (ndt)
--   split prefix/ts/seq (+ UUID column):  16.07 B/test (web100), 6.10 B/test (ndt)
-- The split saves 2.8 B/test on web100 ids but costs more on ndt ids and needs four columns and
-- a reassembly expression, so id stays a plain String.
--
-- Codecs: ZSTD(3) on the floats and ip cuts the whole row from 36.2 to 30.8 B (2019) and from
-- 31.1 to 23.6 B (2026) compared with the default LZ4. The same tests took 56.6 B per test-row
-- pair in `measurements` (x2.02 rows per test), so `tests` should take ~28% of `measurements`
-- (380 GiB -> ~105 GiB for ~4.65 billion tests).
--
-- Sort key: summaries group by geospace within a month partition; shards of states / counties
-- filter on state_id / county_id, which the key prunes. The all-time incremental update looks up
-- the full history of the IPs seen in newly ingested days; those IPs are spread over every
-- geospace, so that lookup is a scan of (upload, ip) with an IN set whatever the key, and an ip
-- bloom filter would match nearly every granule (one day's IPs own ~1% of all tests, spread over
-- all granules). No skip index for that reason; add one with ALTER TABLE ... ADD INDEX if
-- single-IP analysis needs it.
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
