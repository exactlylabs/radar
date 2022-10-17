CREATE MATERIALIZED VIEW us_asns_tmp
ENGINE=MergeTree
ORDER BY (geospace_id, total)
POPULATE
AS
SELECT 
    a.name, a.id, s.geospace_id, s.total
FROM (
    SELECT 
        s.asn_org_id, 
        s.geospace_id, 
        SUM(s.total_samples) as total
    FROM summary_alltime s
    GROUP BY s.asn_org_id, s.geospace_id
) s
JOIN asn_orgs a ON a.id = s.asn_org_id
WHERE a.name != '';