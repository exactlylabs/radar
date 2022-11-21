CREATE MATERIALIZED VIEW summary_week_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_org_id, year, week)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.asn_org_id,
    m_ip.upload,
    m_ip.year as year,
    m_ip.week as week
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_org_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        WEEK(m.time) as week
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_org_id, m.upload, m.ip, year, week
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_org_id, m_ip.upload, m_ip.year, m_ip.week;