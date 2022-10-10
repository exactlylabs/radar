CREATE MATERIALIZED VIEW us_asns_tmp
ENGINE=MergeTree
ORDER BY (geospace_id)
POPULATE
AS
SELECT DISTINCT ON (m.asn_id, m.geospace_id) m.asn_id, m.geospace_id, a.asn, a.organization
FROM measurements m
JOIN asns a ON a.id = m.asn_id
WHERE m.geospace_id IS NOT NULL;