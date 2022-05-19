CREATE MATERIALIZED VIEW IF NOT EXISTS tests_with_geos
ENGINE=MergeTree
PRIMARY KEY id
ORDER BY (id, started_at)
POPULATE
AS
SELECT
  tests.id,
  ip,
  latitude,
  longitude,
  upload,
  started_at,
  mbps,
  loss_rate,
  min_rtt,
  asn,
  asn_org,
  has_access_token,
  access_token_sig,
  geo_namespace,
  geo_id
FROM tests
JOIN test_geos ON tests.id = test_geos.id;