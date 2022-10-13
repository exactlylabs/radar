CREATE MATERIALIZED VIEW us_asns_tmp
ENGINE=MergeTree
ORDER BY (geospace_id)
POPULATE
AS
SELECT DISTINCT ON (m.asn_org_id, m.geospace_id) m.asn_org_id, m.geospace_id, a.name
FROM measurements m
JOIN asn_orgs a ON a.id = m.asn_org_id
WHERE m.geospace_id IS NOT NULL;