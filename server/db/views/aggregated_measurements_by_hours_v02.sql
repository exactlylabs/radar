SELECT
  date_trunc('h', processed_at) as "time",
  account_id,
  autonomous_systems.autonomous_system_org_id,
  location_id,
  percentile_disc(0.5) WITHIN GROUP (ORDER BY download) as "download_median",
  MIN(download) AS "download_min",
  MAX(download) AS "download_max",
  percentile_disc(0.5) WITHIN GROUP (ORDER BY upload) as "upload_median",
  MIN(upload) AS "upload_min",
  MAX(upload) AS "upload_max",
  percentile_disc(0.5) WITHIN GROUP (ORDER BY latency) as "latency_median",
  MIN(latency) AS "latency_min",
  MAX(latency) AS "latency_max",
  SUM(download_total_bytes) as "download_total_bytes",
  SUM(upload_total_bytes) as "upload_total_bytes"

FROM measurements
LEFT JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
WHERE download >= 0 AND upload >= 0
GROUP BY 1, 2, 3, 4
ORDER BY "time" ASC
