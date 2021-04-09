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