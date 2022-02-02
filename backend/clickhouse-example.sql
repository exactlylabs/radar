set max_bytes_before_external_group_by = 5000000000;
set join_algorithm = 'partial_merge';

SELECT
  geo_id,
  geo_namespace,
  countIf(r < 3.0 AND upload = 1) / countIf(upload = 1) as upload_less_than_3,
  countIf(r >= 3.0 AND r < 20.0 AND upload = 1) / countIf(upload = 1) as upload_more_than_3_less_than_20,
  countIf(r >= 20.0 AND upload = 1) / countIf(upload = 1) as upload_more_than_20,
  countIf(r < 25.0 AND upload = 0) / countIf(upload = 0) as download_less_than_25,
  countIf(r >= 25.0 AND r < 100.0 AND upload = 0) / countIf(upload = 0) as download_more_than_25_less_than_100,
  countIf(r >= 100.0 AND upload = 0) / countIf(upload = 0) as download_more_than_100,
  countIf(upload = 0) AS total_samples_down,
  countIf(upload = 1) AS total_samples_up,
  year
FROM (
  SELECT
    geo_namespace,
    geo_id,
    ip,
    upload,
    asn,
    asn_org,
    has_access_token,
    access_token_sig,
    quantileExact(0.5)(mbps) AS r,
    YEAR(started_at) AS year
  FROM (
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
    JOIN test_geos ON tests.id = test_geos.id
  )
  GROUP BY
    geo_namespace,
    geo_id,
    ip,
    upload,
    asn,
    asn_org,
    has_access_token,
    access_token_sig,
    YEAR(started_at)
)
GROUP BY
  geo_namespace,
  geo_id,
  asn,
  asn_org,
  has_access_token,
  access_token_sig,
  year
ORDER BY geo_id
INTO OUTFILE 'county_speeds_by_year.csv' FORMAT CSV;

----- BY MONTH

SELECT
  geo_id,
  geo_namespace,
  countIf(r < 3.0 AND upload = 1) / countIf(upload = 1) as upload_less_than_3,
  countIf(r >= 3.0 AND r < 20.0 AND upload = 1) / countIf(upload = 1) as upload_more_than_3_less_than_20,
  countIf(r >= 20.0 AND upload = 1) / countIf(upload = 1) as upload_more_than_20,
  countIf(r < 25.0 AND upload = 0) / countIf(upload = 0) as download_less_than_25,
  countIf(r >= 25.0 AND r < 100.0 AND upload = 0) / countIf(upload = 0) as download_more_than_25_less_than_100,
  countIf(r >= 100.0 AND upload = 0) / countIf(upload = 0) as download_more_than_100,
  countIf(upload = 0) AS total_samples_down,
  countIf(upload = 1) AS total_samples_up,
  year,
  month
FROM (
  SELECT
    geo_namespace,
    geo_id,
    ip,
    upload,
    asn,
    asn_org,
    has_access_token,
    access_token_sig,
    quantileExact(0.5)(mbps) AS r,
    YEAR(started_at) AS year,
    MONTH(started_at) AS month
  FROM (
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
    JOIN test_geos ON tests.id = test_geos.id
  )
  GROUP BY
    geo_namespace,
    geo_id,
    ip,
    upload,
    asn,
    asn_org,
    has_access_token,
    access_token_sig,
    YEAR(started_at),
    MONTH(started_at)
)
GROUP BY
  geo_namespace,
  geo_id,
  asn,
  asn_org,
  has_access_token,
  access_token_sig,
  year,
  month
ORDER BY geo_id
INTO OUTFILE 'county_speeds_by_month.csv' FORMAT CSV;

---- BY WEEK

SELECT
  geo_id,
  geo_namespace,
  countIf(r < 3.0 AND upload = 1) / countIf(upload = 1) as upload_less_than_3,
  countIf(r >= 3.0 AND r < 20.0 AND upload = 1) / countIf(upload = 1) as upload_more_than_3_less_than_20,
  countIf(r >= 20.0 AND upload = 1) / countIf(upload = 1) as upload_more_than_20,
  countIf(r < 25.0 AND upload = 0) / countIf(upload = 0) as download_less_than_25,
  countIf(r >= 25.0 AND r < 100.0 AND upload = 0) / countIf(upload = 0) as download_more_than_25_less_than_100,
  countIf(r >= 100.0 AND upload = 0) / countIf(upload = 0) as download_more_than_100,
  countIf(upload = 0) AS total_samples_down,
  countIf(upload = 1) AS total_samples_up,
  year,
  week
FROM (
  SELECT
    geo_namespace,
    geo_id,
    ip,
    upload,
    asn,
    asn_org,
    has_access_token,
    access_token_sig,
    quantileExact(0.5)(mbps) AS r,
    YEAR(started_at) AS year,
    toWeek(started_at, 0) AS week
  FROM (
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
    JOIN test_geos ON tests.id = test_geos.id
  )
  GROUP BY
    geo_namespace,
    geo_id,
    ip,
    upload,
    asn,
    asn_org,
    has_access_token,
    access_token_sig,
    YEAR(started_at),
    toWeek(started_at, 0)
)
GROUP BY
  geo_namespace,
  geo_id,
  asn,
  asn_org,
  has_access_token,
  access_token_sig,
  year,
  week
ORDER BY geo_id
INTO OUTFILE 'county_speeds_by_week.csv' FORMAT CSV;

----

SELECT geo_id, countIf(r > 3.0) / count(*) as over_threadhold, count(*) AS samples, year
FROM (
  SELECT geo_namespace, geo_id, ip, upload, quantileExact(0.5)(mbps) AS r, YEAR(started_at) AS year
  FROM tests_with_geos
  GROUP BY geo_namespace, geo_id, ip, upload, YEAR(started_at)
)
WHERE upload = 1
GROUP BY geo_namespace, geo_id, year
ORDER BY geo_id;

----

CREATE MATERIALIZED VIEW tests_with_geos_by_year
ENGINE=MergeTree
ORDER BY (ip, upload, year)
POPULATE
AS
SELECT geo_namespace, geo_id, ip, upload, quantileExact(0.5)(mbps) AS mbps, YEAR(started_at) AS year
FROM tests_with_geos
GROUP BY geo_namespace, geo_id, ip, upload, YEAR(started_at)

CREATE MATERIALIZED VIEW tests_with_geos
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


----

CREATE TABLE tests (
  id FixedString(37),
  ip String,
  latitude float,
  longitude float,
  upload boolean,
  started_at DateTime,
  mbps float,
  loss_rate Nullable(float),
  min_rtt Nullable(float),
  asn int,
  asn_org String,
  has_access_token boolean,
  access_token_sig Nullable(String)
)
ENGINE=MergeTree
PRIMARY KEY id
ORDER BY (id, started_at);

CREATE TABLE test_geos (
  id FixedString(37),
  geo_namespace String,
  geo_id String
)
ENGINE=MergeTree
ORDER BY (id, geo_namespace, geo_id);

--- sample data

INSERT INTO tests (id, upload, started_at, rate) VALUES ('test1', 1, '2021-03-19 12:32:23', 1230.23);
INSERT INTO tests (id, upload, started_at, rate) VALUES ('test2', 1, '2021-03-19 12:32:23', 324.23);
INSERT INTO tests (id, upload, started_at, rate) VALUES ('test3', 1, '2021-03-19 12:32:23', 124.23);
INSERT INTO tests (id, upload, started_at, rate) VALUES ('test4', 0, '2021-03-19 12:32:23', 5324.23);
INSERT INTO tests (id, upload, started_at, rate) VALUES ('test5', 1, '2021-03-19 12:32:23', 4324.23);
INSERT INTO tests (id, upload, started_at, rate) VALUES ('test6', 1, '2021-03-19 12:32:23', 32.23);
INSERT INTO tests (id, upload, started_at, rate) VALUES ('test7', 1, '2021-01-19 12:32:23', 23324.23);


INSERT INTO test_geos (id, geo_namespace, geoid) VALUES ('test1', 'US_COUNTIES', '31039');
INSERT INTO test_geos (id, geo_namespace, geoid) VALUES ('test2', 'US_COUNTIES', '31039');
INSERT INTO test_geos (id, geo_namespace, geoid) VALUES ('test3', 'US_COUNTIES', '31039');
INSERT INTO test_geos (id, geo_namespace, geoid) VALUES ('test4', 'US_COUNTIES', '31039');
INSERT INTO test_geos (id, geo_namespace, geoid) VALUES ('test5', 'US_COUNTIES', '31039');
INSERT INTO test_geos (id, geo_namespace, geoid) VALUES ('test6', 'US_COUNTIES', '31039');
INSERT INTO test_geos (id, geo_namespace, geoid) VALUES ('test7', 'US_COUNTIES', '31039');

--- example aggregate

SELECT geoid, medianDeterministic(rate, 1)
FROM tests
JOIN test_geos ON tests.id = test_geos.id
WHERE upload = 1
AND started_at >= '2021-03-01 00:00:00'
AND started_at <= '2021-03-20 00:00:00'
GROUP BY geoid;

-- Bulk insert
--cat data.csv | clickhouse-client --query="INSERT INTO tests FORMAT CSVWithNames"

-- Delete



alter table tests DELETE WHERE id is not null;

-----

SELECT geoid, quantileExact(0.5)(r) AS rate, count(*) AS samples
FROM (
	SELECT geoid, ip, upload, toDate(started_at) as sa, quantileExact(0.5)(rate) as r
	FROM tests
  JOIN test_geos ON tests.id = test_geos.id
	GROUP BY geoid, ip, upload, toDate(started_at)
)
WHERE upload = ?
AND sa >= ?
AND sa <= ?
GROUP BY geoid
ORDER BY geoid;

-----

SELECT geo_namespace, geo_id, quantileExact(0.5)(r) AS rate, count(*) AS samples
FROM (
	SELECT geo_namespace, geo_id, ip, upload, quantileExact(0.5)(mbps) as r
	FROM tests
  JOIN test_geos ON tests.id = test_geos.id
  WHERE started_at >= ?
  AND started_at < ?
  AND geo_namespace = ?
	GROUP BY geo_namespace, geo_id, ip, upload
)
WHERE upload = ?
GROUP BY geo_namespace, geo_id
ORDER BY geo_id;


---- create test_medians table based on medians

CREATE TABLE test_medians 
(
  geoid String,
  ip String,
  latitude float,
  longitude float,
  upload boolean,
  started_at DateTime,
  rate float
) ENGINE=MergeTree 
ORDER BY (geoid, ip, started_at)
AS SELECT geoid, ip, latitude, longitude, upload, started_at, quantileExact(0.5)(rate) as rate
	FROM tests
	GROUP BY geoid, ip, latitude, longitude, upload, toDate(started_at) as started_at;

----------- Median > 25/3

SELECT A.geoid, download_good = 1 AND upload_good = 1 AS good
FROM (
  SELECT geoid
  FROM test_medians
  GROUP BY geoid
) A
LEFT OUTER JOIN
(
  SELECT geoid, if(quantileExact(0.5)(rate) >= 25600, 1, 0) AS download_good
  FROM test_medians
  WHERE upload = 0
  GROUP BY geoid
) B ON A.geoid = B.geoid
LEFT OUTER JOIN
(
  SELECT geoid, if(quantileExact(0.5)(rate) >= 3072, 1, 0) AS upload_good
  FROM test_medians
  WHERE upload = 1
  GROUP BY geoid
) C ON A.geoid = C.geoid;

--------- Median 90% > 25/3

SELECT A.geoid, download_good = 1 AND upload_good = 1 AS good
FROM (
  SELECT geoid
  FROM test_medians
  GROUP BY geoid
) A
LEFT OUTER JOIN
(
  SELECT geoid, if(quantileExact(0.1)(rate) >= 25600, 1, 0) AS download_good
  FROM test_medians
  WHERE upload = 0
  GROUP BY geoid
) B ON A.geoid = B.geoid
LEFT OUTER JOIN
(
  SELECT geoid, if(quantileExact(0.1)(rate) >= 3072, 1, 0) AS upload_good
  FROM test_medians
  WHERE upload = 1
  GROUP BY geoid
) C ON A.geoid = C.geoid;

--------- % > 25/3

SELECT A.geoid, if(B.percent_good > C.percent_good, C.percent_good, B.percent_good) AS good
FROM (
  SELECT geoid
  FROM test_medians
  GROUP BY geoid
) A
LEFT OUTER JOIN
(
  SELECT geoid, countIf(rate >= 25600) / toDecimal64(if(count(*) = 0, 1, count(*)), 5) AS percent_good
  FROM test_medians
  WHERE upload = 1
  GROUP BY geoid
) B ON A.geoid = B.geoid
LEFT OUTER JOIN
(
  SELECT geoid, countIf(rate >= 3072) / toDecimal64(if(count(*) = 0, 1, count(*)), 5) AS percent_good
  FROM test_medians
  WHERE upload = 1
  GROUP BY geoid
) C ON A.geoid = C.geoid;

---------
SELECT geoid, if(quantileExact(0.5)(rate) >= 25600 AS rate FROM test_medians　WHERE upload = 0　GROUP BY geoid;
