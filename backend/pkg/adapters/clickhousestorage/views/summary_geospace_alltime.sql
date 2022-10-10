CREATE MATERIALIZED VIEW summary_geospace_alltime_tmp
ENGINE=AggregatingMergeTree()
ORDER BY (geospace_id)
POPULATE
AS
SELECT
    quantileExactState(0.5)(m_ip.med_download_ip_mbps) as med_download_mbps,
    quantileExactState(0.5)(m_ip.med_upload_ip_mbps) as med_upload_mbps,
    quantileExactState(0.5)(m_ip.med_download_ip_rtt) as med_download_min_rtt,
    quantileExactState(0.5)(m_ip.med_upload_ip_rtt) as med_upload_min_rtt,
    CountIfState(med_download_ip_mbps < 25) as bad_download_count,
    CountIfState(med_upload_ip_mbps < 3) as bad_upload_count,
    CountIfState(med_download_ip_mbps >= 25 AND med_download_ip_mbps < 100) as normal_download_count,
    CountIfState(med_upload_ip_mbps >= 3 AND med_upload_ip_mbps < 20) as normal_upload_count,
    CountIfState(med_download_ip_mbps > 100) as good_download_count,
    CountIfState(med_upload_ip_mbps > 20) as good_upload_count,
    SumState(has_download) as total_download_samples,
    SumState(has_upload) as total_upload_samples,
    m_ip.geospace_id
FROM (
    SELECT 
        m.geospace_id, 
        quantileExactIf(0.5)(m.mbps, m.upload = 0) as med_download_ip_mbps,
        quantileExactIf(0.5)(m.mbps, m.upload = 1) as med_upload_ip_mbps,
        quantileExactIf(0.5)(m.min_rtt, m.upload = 0) as med_download_ip_rtt,
        quantileExactIf(0.5)(m.min_rtt, m.upload = 1) as med_upload_ip_rtt,
        CountIf(DISTINCT m.ip, upload = 1) as has_upload,
        CountIf(DISTINCT m.ip, upload = 0) as has_download
    FROM measurements m
    GROUP BY m.geospace_id, m.ip
) m_ip 
GROUP BY m_ip.geospace_id;