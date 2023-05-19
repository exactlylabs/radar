CREATE TABLE IF NOT EXISTS geospaces
(
    `id` UUID,
    `name` Nullable(VARCHAR),
    `namespace` VARCHAR,
    `geo_id` VARCHAR,
    `centroid_lat` DOUBLE PRECISION,
    `centroid_long` DOUBLE PRECISION,
    `parent_id` Nullable(UUID)
)
ENGINE = MergeTree
PRIMARY KEY (namespace, geo_id)
ORDER BY (namespace, geo_id);
