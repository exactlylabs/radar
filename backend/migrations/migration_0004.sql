CREATE MATERIALIZED VIEW IF NOT EXISTS tests_with_geos_by_year
ENGINE=MergeTree
ORDER BY (ip, upload, year)
POPULATE
AS
SELECT geo_namespace, geo_id, ip, upload, quantileExact(0.5)(mbps) AS mbps, YEAR(started_at) AS year
FROM tests_with_geos
GROUP BY geo_namespace, geo_id, ip, upload, YEAR(started_at)