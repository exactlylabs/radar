SELECT
  date_trunc('$bucket', processed_at) as "time",
  SUM(measurements.download_total_bytes) + SUM(measurements.upload_total_bytes) AS "Data Used"
FROM measurements
JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
WHERE
  $__timeFilter(processed_at)
  AND account_id IN ($accounts)
  AND CASE WHEN '${as_orgs:csv}' = '-1' THEN 
      true
    ELSE
      autonomous_system_orgs.id IN ($as_orgs)
    END
    AND CASE WHEN '${locations:csv}' = '-1' THEN 
      true
    ELSE
      location_id IN ($locations)
    END
GROUP BY 1
ORDER BY 1 ASC