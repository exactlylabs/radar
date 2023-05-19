CREATE TABLE IF NOT EXISTS asn_orgs
(
    `id` UUID,
    `name` VARCHAR
)
ENGINE = MergeTree
PRIMARY KEY id;
