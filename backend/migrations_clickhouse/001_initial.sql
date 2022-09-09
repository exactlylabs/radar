CREATE TABLE IF NOT EXISTS geospaces
(
    `id` UUID,
    `name` Nullable(VARCHAR),
    `namespace` VARCHAR,
    `geo_id` VARCHAR,
    `parent_id` Nullable(UUID)
)
ENGINE = MergeTree
PRIMARY KEY id;


CREATE TABLE IF NOT EXISTS asns
(
    `id` UUID,
    `asn` INT,
    `organization` VARCHAR
)
ENGINE = MergeTree
PRIMARY KEY id;

CREATE TABLE IF NOT EXISTS measurements (
    id VARCHAR,
    test_style VARCHAR,
    ip VARCHAR,
    time DATETIME('UTC') NOT NULL,
    upload BOOLEAN,
    mbps DOUBLE PRECISION,
    loss_rate DOUBLE PRECISION,
    min_rtt DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy_km DOUBLE PRECISION,
    has_access_token BOOLEAN,
    access_token_sig VARCHAR,
    asn_id UUID,
    geospace_id UUID,
)
ENGINE = MergeTree
ORDER BY time;

-- Materialized Views

CREATE MATERIALIZED VIEW summary_year
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year;

CREATE MATERIALIZED VIEW summary_geospace_year
ENGINE=MergeTree
ORDER BY (upload, geospace_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year as year
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year;


-- Half Year


CREATE MATERIALIZED VIEW summary_semester
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year,
    m_ip.semester
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        (MONTH(m.time) / 6)::int + 1 as semester
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year, semester
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year, m_ip.semester;

CREATE MATERIALIZED VIEW summary_geospace_semester
ENGINE=MergeTree
ORDER BY (upload, geospace_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year,
    m_ip.semester
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        (MONTH(m.time) / 6)::int + 1 as semester
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year, semester
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year, m_ip.semester;


-- Month


CREATE MATERIALIZED VIEW summary_month
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year,
    m_ip.month
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        MONTH(m.time) as month
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year, month
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year, m_ip.month;

CREATE MATERIALIZED VIEW summary_geospace_month
ENGINE=MergeTree
ORDER BY (upload, geospace_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year,
    m_ip.month
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        MONTH(m.time) as month
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year, month
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year, m_ip.month;


-- Week

CREATE MATERIALIZED VIEW summary_week
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year,
    m_ip.week,
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        WEEK(m.time) as week
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year, week
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year, m_ip.week;

CREATE MATERIALIZED VIEW summary_geospace_week
ENGINE=MergeTree
ORDER BY (upload, geospace_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < 25) as bad,
    CountIf(med_ip_mbps >= 25 AND med_ip_mbps < 100) as normal,
    CountIf(med_ip_mbps >= 100) as good,
    CountIf(upload=1) as total_upload_samples,
    CountIf(upload=0) as total_download_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year,
    m_ip.week
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        WEEK(m.time) as week
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year, week
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year, m_ip.week;
