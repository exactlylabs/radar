with base_series AS (
  SELECT 
    date_trunc('$bucket', dd) as "time"
  FROM generate_series(
    $__timeFrom() , $__timeTo(), '1 $bucket'::interval
  ) dd
), selected_ids AS (
  SELECT 
    UNNEST('{ ${aggregates:csv} }'::text[]) as id

), selected_study_aggregate_ids AS (
  SELECT
      id::bigint
    FROM selected_ids
    WHERE LEFT(id, 6) != 'other_'
), selected_other_ids AS (
  SELECT
    REPLACE(id, 'other_', '')::bigint as id
  FROM selected_ids
  WHERE LEFT(id, 6) = 'other_'
), aggregates AS (
  SELECT 
    *
  FROM study_aggregates
  WHERE 
    level = '$level'
    AND (
      id IN (SELECT id FROM selected_study_aggregate_ids) 
      OR (study_aggregate=false AND parent_aggregate_id IN (SELECT id FROM selected_other_ids))
    )

), filtered_dimensions AS (
  SELECT
    date_trunc('d', "timestamp") as "time",
    location_id,
    CASE WHEN MAX(online_count) > 0 THEN 1 ELSE 0 END as incr
  FROM study_level_projections
  WHERE 
    study_aggregate_id IN (SELECT id FROM selected_study_aggregate_ids)
    AND CASE WHEN '${as_orgs:csv}' != '-1' THEN
      study_level_projections.autonomous_system_org_id IN ($as_orgs)
    ELSE 
      true 
    END
  GROUP BY 1, 2
), matched_locations AS (
  SELECT
    DISTINCT(location_id) as location_id
  FROM filtered_dimensions
), with_all_days AS (
  SELECT
    "time", location_id, MAX(incr) as incr
  FROM (
    SELECT
      "time", location_id, incr as incr
    FROM filtered_dimensions
    UNION
    SELECT 
      base_series."time", matched_locations.location_id, NULL as incr
    FROM base_series, matched_locations
  ) t
  GROUP BY 1, 2
), forward_fill_online_days AS (
  SELECT 
    "time",
    location_id,
    COALESCE(incr, FIRST_VALUE(incr) OVER (PARTITION BY location_id, non_null_count ORDER BY "time")) as incr
  FROM (
    SELECT
      with_all_days.*, COUNT(incr) OVER (PARTITION BY location_id ORDER BY "time") as non_null_count
    FROM with_all_days
  ) t

), online_days_per_location AS (
  SELECT
    CASE WHEN SUM(incr) OVER (PARTITION BY location_id ORDER BY "time" ASC) = 90 THEN 1 ELSE 0 END as "incr",
    location_id,
    "time"
  FROM forward_fill_online_days

), completed_locations AS (
  SELECT 
    SUM(incr) OVER(ORDER BY "time") as total_completed, 
    "time"
  FROM (
    SELECT "time", SUM(incr) as incr FROM online_days_per_location GROUP BY 1
  ) t
), time_filtered AS (
  SELECT 
    *
  FROM completed_locations
  WHERE $__timeFilter("time")
  ORDER BY "time" ASC
), initial AS (
  SELECT 
    *
  FROM completed_locations
  WHERE "time" < $__timeFrom()::timestamp
  ORDER BY "time" DESC LIMIT 1
), table_with_initial AS (
  SELECT 
    $__timeFrom()::timestamp AS "time", 
    total_completed
  FROM initial
  
  UNION
    
    SELECT "time", NULL as total_completed FROM base_series

  UNION

  SELECT 
    "time", total_completed
  FROM time_filtered

  ORDER BY "time" ASC
)

SELECT "time", MAX(total_completed) as total_completed
FROM table_with_initial
GROUP BY "time"
ORDER BY "time" ASC
