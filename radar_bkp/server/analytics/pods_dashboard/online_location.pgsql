WITH base_series AS (
  SELECT 
    date_trunc('$bucket', dd) as "time"
  FROM generate_series(
    $__timeFrom()::timestamp , $__timeTo()::timestamp, '1 $bucket'::interval
  ) dd
), filtered_dimensions AS (
  SELECT 
    online_client_count_projections.id,
    online,
    CASE WHEN online > 0 THEN 1 ELSE 0 END AS is_online,
    account_id, 
    autonomous_system_id, 
    location_id, 
    timestamp as "time"
  FROM online_client_count_projections
  LEFT JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
  LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  WHERE 
    location_id IS NOT NULL
    AND CASE WHEN '${accounts:csv}' = '-1' THEN
      true
    ELSE
      account_id IN ($accounts)
    END
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

), initial_state AS (
  SELECT
    DISTINCT ON (account_id, autonomous_system_id, location_id) account_id, autonomous_system_id, location_id,
    id,
    CASE WHEN online > 0 THEN 1 ELSE 0 END as is_online
  FROM filtered_dimensions
  WHERE "time" < $__timeFrom()
  ORDER BY account_id, autonomous_system_id, location_id, id DESC
), time_filtered AS (
  SELECT 
    *
  FROM filtered_dimensions
  WHERE $__timeFilter("time")
  ORDER BY "time", id ASC
), table_with_initial AS (
  SELECT 
    id,
    $__timeFrom()::timestamp AS "time", 
    is_online,
    account_id,
    autonomous_system_id,
    location_id
  FROM initial_state

  UNION

  SELECT 
    id, "time", is_online, account_id, autonomous_system_id, location_id
  FROM time_filtered

  ORDER BY "time" ASC
  
), table_with_incrs AS (
  SELECT $__timeFrom()::timestamp as "time", COUNT(*) as "incr"
  FROM initial_state WHERE is_online > 0
  UNION
  SELECT
    "time", 
    is_online - COALESCE(LAG(is_online, 1) OVER (PARTITION BY (account_id, autonomous_system_id, location_id) ORDER BY table_with_initial.id), 0) AS "incr"
  FROM table_with_initial
), table_with_base_series  AS (
  SELECT "time", 0 as incr FROM base_series
  
  UNION

  SELECT "time", incr FROM table_with_incrs
  
), windowed_sum AS (
  SELECT
    "time",
    SUM(incr) OVER (ORDER BY time ASC) as total_online
  FROM table_with_base_series
), count_by_bucket AS (
  SELECT
    $__timeGroup("time", '1m') as "time",
    MIN(total_online) as "total_online"
  FROM windowed_sum
  GROUP BY 1
)

SELECT * FROM count_by_bucket
ORDER BY "time" ASC