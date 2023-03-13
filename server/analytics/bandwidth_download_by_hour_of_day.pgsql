WITH measurements_with_ratios AS (
  SELECT 
    measurements.*
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
)

SELECT
  extract (hour FROM "processed_at")::integer as "hour",
  percentile_disc(0.5) WITHIN GROUP (ORDER BY download) AS "Median",
  MAX(download) as "Max",
  MIN(download) as "Min"
FROM measurements_with_ratios
GROUP BY 1
ORDER BY 1