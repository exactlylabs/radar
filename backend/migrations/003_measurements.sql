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
    asn_org_id UUID,
    geospace_id UUID,
    INDEX time_minmax_idx time TYPE minmax GRANULARITY 2
)
ENGINE = MergeTree
PRIMARY KEY (upload, geospace_id, asn_org_id)
ORDER BY (upload, geospace_id, asn_org_id, time)
SETTINGS index_granularity = 8192
;
