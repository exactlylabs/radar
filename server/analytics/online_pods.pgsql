with base_series AS (
  SELECT 
    date_trunc('min', dd) as "time"
  FROM generate_series(
    '2023-03-06T21:39:17.869Z'::timestamp , '2023-03-06T21:55:23.879Z'::timestamp, '1 min'::interval
  ) dd
), online_status_changes as (
  SELECT 
    online - COALESCE(LAG(online, 1) OVER (partition by (account_id, autonomous_system_id, location_id) ORDER BY online_client_count_projections.id), 0) as incr, 
    online,
    account_id, 
    autonomous_system_id, 
    location_id, 
    timestamp as "time" 
  FROM online_client_count_projections
  LEFT JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
  LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  -- Filter by dimensions here
  WHERE 
    account_id IN ('9')
    -- AND CASE WHEN '${as_orgs:csv}' = '-1' THEN 
    --   true
    -- ELSE
    --   autonomous_system_orgs.id IN ($as_orgs)
    -- END
    -- AND CASE WHEN '${locations:csv}' = '-1' THEN 
    --   true
    -- ELSE
    --   location_id IN ($locations)
    -- END
  -- This filter is enforcing that only pods that are claimed and belong to a location will be considered.
), accumulated_counts AS (
  SELECT 
  time,
  SUM(incr) OVER (ORDER BY time) as total_online
  FROM online_status_changes
), count_right_before AS (
  SELECT * 
  FROM accumulated_counts
  WHERE time < '2023-03-06T21:39:17.869Z'
  ORDER BY time DESC LIMIT 1
), count_at_end AS (
  SELECT * 
  FROM accumulated_counts
  WHERE time <= '2023-03-06T21:55:23.879Z'
  ORDER BY time DESC LIMIT 1
), count_with_initial AS (
  SELECT
    *
  FROM accumulated_counts
  WHERE 
    "time" BETWEEN '2023-03-06T21:39:17.869Z' AND '2023-03-06T21:55:23.879Z'
  UNION
  SELECT '2023-03-06T21:39:17.869Z'::timestamp, total_online 
  FROM count_right_before
  UNION
  SELECT '2023-03-06T21:55:23.879Z'::timestamp, total_online 
  FROM count_at_end
), count_by_min AS (
  SELECT 
    date_trunc('min', "time") as "time",
    MAX(total_online) as "total_online"
  FROM count_with_initial
  GROUP BY 1
), all_points_count AS (
  SELECT 
    base_series."time", total_online
  FROM base_series
  LEFT JOIN count_by_min t2 ON t2.time = base_series.time
), all_points_count_ffill AS (
  SELECT
    t."time",
    COALESCE(total_online, FIRST_VALUE(total_online) OVER (PARTITION BY non_null_count ORDER BY t."time")) as "total_online"
  FROM (
     -- Create a new column with the window count of the online value
    -- This count will keep its value until there's a non-null value in the online field, in which it increases by one
    SELECT *, COUNT(total_online) OVER (ORDER BY all_points_count."time") as non_null_count
    FROM all_points_count
  ) t
)


SELECT * FROM online_status_changes
ORDER BY time ASC