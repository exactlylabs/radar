CREATE TABLE tests (
  id FixedString(37),
  geoid String,
  ip String,
  latitude float,
  longitude float,
  upload boolean,
  started_at DateTime,
  rate float
)
ENGINE=MergeTree
PRIMARY KEY id
ORDER BY (id, started_at);

--- sample data

INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test1', '31039', 1, '2021-03-19 12:32:23', 1230.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test2', '31039', 1, '2021-03-19 12:32:23', 324.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test3', '31039', 1, '2021-03-19 12:32:23', 124.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test4', '31039', 0, '2021-03-19 12:32:23', 5324.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test5', '31039', 1, '2021-03-19 12:32:23', 4324.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test6', '31039', 1, '2021-03-19 12:32:23', 32.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test7', '31039', 1, '2021-01-19 12:32:23', 23324.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test7', '53069', 1, '2021-01-19 12:32:23', 132.23);
INSERT INTO tests (id, geoid, upload, started_at, rate) VALUES ('test7', '53069', 1, '2021-03-19 12:32:23', 82);

--- example aggregate

SELECT geoid, medianDeterministic(rate, 1)
FROM tests
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
	GROUP BY geoid, ip, upload, toDate(started_at)
)
WHERE upload = ?
AND sa >= ?
AND sa <= ?
GROUP BY geoid
ORDER BY geoid;


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