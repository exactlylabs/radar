WITH location_grouped AS (
  SELECT
    date_trunc('$bucket', processed_at) as "time",
    percentile_disc(0.5) WITHIN GROUP (ORDER BY measurements.download) as "median",
    MIN(measurements.download) AS "_min",
    MAX(measurements.download) AS "_max",
    location_id

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

  GROUP BY 1, location_id
  ORDER BY "time" ASC
)

SELECT 
  time,
  MAX(_max) AS "Max",
  percentile_disc(0.5) WITHIN GROUP (ORDER BY median) as "Median",
  MIN(_min) AS "Min"
FROM location_grouped
GROUP BY 1
ORDER BY "time"