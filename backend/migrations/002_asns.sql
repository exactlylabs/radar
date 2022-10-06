CREATE TABLE IF NOT EXISTS asns
(
    `id` UUID,
    `asn` INT,
    `organization` VARCHAR
)
ENGINE = MergeTree
PRIMARY KEY id;