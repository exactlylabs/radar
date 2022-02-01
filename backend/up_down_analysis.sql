select fips."state", fips."name" as county, geo_id as county_fips, upload_less_than_3, upload_more_than_3_less_than_20, upload_more_than_20, download_less_than_25, download_more_than_25_less_than_100, download_more_than_100, total_samples_up, total_samples_down, year
from county_speeds
join fips
on county_speeds.geo_id = fips.fips
where state = 'PA';

------


SET join_algorithm = 'partial_merge';

SELECT geo_id, countIf(r > 3.0) / count(*) as over_threshold, count(*) AS samples, year
FROM (
  SELECT geo_namespace, geo_id, ip, upload, quantileExact(0.5)(mbps) as r, YEAR(started_at) as year
  FROM tests
  JOIN test_geos ON tests.id = test_geos.id
  WHERE geo_namespace = 'US_COUNTIES'
  GROUP BY geo_namespace, geo_id, ip, upload, YEAR(started_at)
)
WHERE upload = 1
GROUP BY geo_namespace, geo_id, year
ORDER BY geo_id
;

-----------

select fips."state", fips."name", fips.fips, counties_up_above_3."percent" as up_above_3, counties_up_above_3.samples as up_samples, counties_down_above_25."percent" as down_above_25, counties_down_above_25.samples as down_samples from fips
left outer join counties_up_above_3 on counties_up_above_3.fip = fips.fips
left outer join counties_down_above_25 on counties_down_above_25.fip = fips.fips

SET join_algorithm = 'partial_merge';

SELECT geo_id, countIf(r > 3.0) / count(*) as over_threshold, count(*) AS samples
FROM (
  SELECT geo_namespace, geo_id, ip, upload, quantileExact(0.5)(mbps) as r
  FROM tests
  JOIN test_geos ON tests.id = test_geos.id
  WHERE geo_namespace = 'US_COUNTIES'
  AND started_at >= '2021-12-01'
  AND started_at < '2022-01-01'
  GROUP BY geo_namespace, geo_id, ip, upload
)
WHERE upload = 1
GROUP BY geo_namespace, geo_id
ORDER BY geo_id
INTO OUTFILE 'counties_up_above_3.csv' FORMAT CSV

SELECT geo_id, countIf(r > 25.0) / count(*) as over_threshold, count(*) AS samples
FROM (
  SELECT geo_namespace, geo_id, ip, upload, quantileExact(0.5)(mbps) as r
  FROM tests
  JOIN test_geos ON tests.id = test_geos.id
  WHERE geo_namespace = 'US_COUNTIES'
  AND started_at >= '2021-12-01'
  AND started_at < '2022-01-01'
  GROUP BY geo_namespace, geo_id, ip, upload
)
WHERE upload = 0
GROUP BY geo_namespace, geo_id
ORDER BY geo_id
INTO OUTFILE 'counties_down_above_25.csv' FORMAT CSV