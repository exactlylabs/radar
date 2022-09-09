CREATE EXTENSION timescaledb;
CREATE EXTENSION timescaledb_toolkit;

CREATE TABLE IF NOT EXISTS geospaces (
    id BIGSERIAL PRIMARY KEY,
    geo_namespace VARCHAR,
    geo_id VARCHAR
);
CREATE UNIQUE INDEX geospaces_unique ON geospaces (geo_namespace, geo_id);

CREATE TABLE IF NOT EXISTS asns (
    id BIGSERIAL PRIMARY KEY,
    asn INT,
    organization VARCHAR
);
CREATE UNIQUE INDEX asns_unique ON asns (asn, organization);

CREATE TABLE IF NOT EXISTS measurements (
    id VARCHAR,
    test_style VARCHAR,
    ip VARCHAR,
    time TIMESTAMPTZ NOT NULL,
    upload BOOLEAN,
    mbps DOUBLE PRECISION,
    loss_rate DOUBLE PRECISION,
    min_rtt DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy_km DOUBLE PRECISION,
    has_access_token BOOLEAN,
    access_token_sig VARCHAR,
    asn_id BIGINT REFERENCES asn (id) ON DELETE SET NULL,
    geospace_id BIGINT REFERENCES geospaces (id) ON DELETE SET NULL
);
SELECT create_hypertable('measurements', 'time', chunk_time_interval => INTERVAL '7 day');
CREATE INDEX IF NOT EXISTS measurements_geospace_index ON measurements(geospace_id, asn_id, upload, time DESC) WITH (timescaledb.transaction_per_chunk);
CREATE INDEX IF NOT EXISTS measurements_geospace_index ON measurements(geospace_id, asn_id, upload, ip, time DESC) WITH (timescaledb.transaction_per_chunk);


-- Yearly


CREATE MATERIALIZED VIEW IF NOT EXISTS summary_yearly AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('1 year', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            asn_id,
            stats_agg(mbps) stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, asn_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        asn_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, asn_id, upload
) WITH NO DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS summary_geospace_yearly AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('1 year', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            stats_agg(mbps) as stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, upload
) WITH NO DATA;

-- Half Year

CREATE MATERIALIZED VIEW IF NOT EXISTS summary_half_year AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('6 month', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            asn_id,
            stats_agg(mbps) stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, asn_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        asn_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, asn_id, upload
) WITH NO DATA;



CREATE MATERIALIZED VIEW IF NOT EXISTS summary_geospace_half_year AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('6 month', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            stats_agg(mbps) as stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, upload
) WITH NO DATA;

-- Monthly

CREATE MATERIALIZED VIEW IF NOT EXISTS summary_monthly AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('1 month', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            asn_id,
            stats_agg(mbps) stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, asn_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        asn_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, asn_id, upload
) WITH NO DATA;



CREATE MATERIALIZED VIEW IF NOT EXISTS summary_geospace_monthly AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('1 month', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            stats_agg(mbps) as stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, upload
) WITH NO DATA;

-- Weekly

CREATE MATERIALIZED VIEW IF NOT EXISTS summary_weekly AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('7 day', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            asn_id,
            stats_agg(mbps) stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, asn_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        asn_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, asn_id, upload
) WITH NO DATA;



CREATE MATERIALIZED VIEW IF NOT EXISTS summary_geospace_weekly AS (
    WITH ip_groups AS (
        SELECT 
            time_bucket('7 day', m.time, origin => '2000-01-01') as bucket,
            geospace_id,
            stats_agg(mbps) as stats,
            approx_percentile(0.5, percentile_agg(mbps)) percentiles_mbps,
            approx_percentile(0.5, percentile_agg(min_rtt)) percentiles_rtt,
            upload,
            ip
        FROM measurements m
        GROUP BY bucket, geospace_id, upload, ip
    )
    SELECT 
        bucket,
        geospace_id,
        ROLLUP(ip_groups.stats) stats,
        percentile_agg(ip_groups.percentiles_mbps) percentiles_mbps,
        percentile_agg(ip_groups.percentiles_rtt) percentiles_rtt,
        upload
    FROM ip_groups
    GROUP BY bucket, geospace_id, upload
) WITH NO DATA;


-- Continuous Aggregates --
-- Our base aggregate is daily, so all other aggregates can be based on this one

CREATE MATERIALIZED VIEW IF NOT EXISTS summary
WITH (timescaledb.continuous, timescaledb.materialized_only=true) AS (
    SELECT 
        time_bucket('1 day', m.time) bucket,
        geospace_id,
        count(*) as total,
        count(*) FILTER (WHERE m.mbps < 25) as bad,
        count(*) FILTER (WHERE m.mbps >= 25 AND mbps < 100) as normal,
        count(*) FILTER (WHERE m.mbps >= 100) as good,
        asn_id,
        stats_agg(mbps) stats,
        percentile_agg(mbps) percentiles_mbps,
        percentile_agg(min_rtt) percentiles_rtt,
        upload
        
    FROM measurements m
    GROUP BY bucket, upload, geospace_id, asn_id
) WITH NO DATA;
SELECT add_continuous_aggregate_policy('summary', start_offset => INTERVAL '1 month', end_offset => NULL, schedule_interval => INTERVAL '24 hours', if_not_exists => true);

-- Index to enable us to check all ASNs of a given geospace_id in a time bucket
-- CREATE INDEX asn_idx ON _timescaledb_internal._materialized_hypertable_6 (geospace_id, bucket, asn_id);
-- Unfortunatelly, we can only create an index for constinuous aggregates using their hypertable name, which we don't have unless we run the query bellow
-- SELECT view_name, format('%I.%I', materialization_hypertable_schema,
--         materialization_hypertable_name) AS materialization_hypertable
--     FROM timescaledb_information.continuous_aggregates WHERE view_name='summary';



CREATE MATERIALIZED VIEW IF NOT EXISTS summary_geospace
WITH (timescaledb.continuous, timescaledb.materialized_only=true) AS (
    SELECT 
        time_bucket('1 day', m.time) bucket,
        geospace_id,
        count(*) as total,
        count(*) FILTER (WHERE m.mbps < 25) as bad,
        count(*) FILTER (WHERE m.mbps >= 25 AND mbps < 100) as normal,
        count(*) FILTER (WHERE m.mbps >= 100) as good,
        stats_agg(mbps) stats,
        percentile_agg(mbps) percentiles_mbps,
        percentile_agg(min_rtt) percentiles_rtt,
        upload
        
    FROM measurements m
    GROUP BY bucket, upload, geospace_id
) WITH NO DATA;
SELECT add_continuous_aggregate_policy('summary_geospace', start_offset => INTERVAL '1 month', end_offset => NULL, schedule_interval => INTERVAL '24 hours', if_not_exists => true);


CREATE MATERIALIZED VIEW IF NOT EXISTS geospace_asns
WITH (timescaledb.continuous, timescaledb.materialized_only=true) as (
    SELECT
        time_bucket('1 day', m.time) bucket,
        asn_id,
        geospace_id
        FROM measurements m
        GROUP BY bucket, geospace_id, asn_id
) WITH NO DATA;
SELECT add_continuous_aggregate_policy('geospace_asns', start_offset => INTERVAL '1 month', end_offset => NULL, schedule_interval => INTERVAL '24 hours', if_not_exists => true);

-- Query: SELECT BY geospace only (State, County and etc)
-- SELECT 
--     time_bucket('366 day', bucket, origin => (NOW() - INTERVAL '1 year')::date) as b,
--     sum(s.total) as total_samples,
--     sum(s.bad) as total_bad,
--     sum(s.normal) as total_normal,
--     sum(s.good) as total_good,
--     upload,
--     approx_percentile(0.5, ROLLUP(s.percentiles_mbps)) as upload_med_mbps,
--     approx_percentile(0.5, ROLLUP(s.percentiles_rtt)) as upload_med_rtt
--     FROM summary_geospace s
--     WHERE 
--         s.bucket > (NOW() - INTERVAL '1 year')::date
--         AND geospace_id=1
--     GROUP BY b, upload
-- ;

-- Query: SELECT BY geospace and ASN

-- SELECT 
--     time_bucket('366 day', bucket, origin => (NOW() - INTERVAL '1 year')::date) as b,
--     sum(s.total) as total_samples,
--     sum(s.bad) as total_bad,
--     sum(s.normal) as total_normal,
--     sum(s.good) as total_good,
--     upload,
--     approx_percentile(0.5, ROLLUP(s.percentiles_mbps)) as upload_med_mbps,
--     approx_percentile(0.5, ROLLUP(s.percentiles_rtt)) as upload_med_rtt
--     FROM summary s
--     WHERE 
--         s.bucket > (NOW() - INTERVAL '1 year')::date
--         AND geospace_id=? AND asn_id=?
--     GROUP BY b, upload
-- ;


-- Query: ASNs Available for a geospace

-- SELECT
--     s.asn_id
-- FROM summary s
-- WHERE 
--     s.geospace_id=1
-- GROUP BY s.asn_id
-- ;


-- Query: ASNs Available for a geospace in a time bucket
-- TODO: Need to check performance of this.

-- SELECT
--     time_bucket('366 day', bucket, origin => (NOW() - INTERVAL '1 year')::date) as b,
--     s.asn_id
-- FROM summary s
-- WHERE 
--     s.bucket > (NOW() - INTERVAL '1 year')::date
--     AND s.geospace_id=1
-- GROUP BY b, s.asn_id
-- ;


-- WITH V AS (
-- SELECT 
--     time_bucket('1 day', m.time) bucket
-- FROM measurements m
-- WHERE m.time > NOW() - INTERVAL '1 year'
-- GROUP BY bucket, upload, geospace_id, asn_id, ip
-- ) SELECT count(*) FROM V;