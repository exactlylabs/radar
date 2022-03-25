CREATE TABLE IF NOT EXISTS test_geos (
  id FixedString(37),
  geo_namespace String,
  geo_id String
)
ENGINE=MergeTree
ORDER BY (id, geo_namespace, geo_id)
