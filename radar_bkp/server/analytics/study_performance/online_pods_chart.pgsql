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
    "timestamp" as "time",
    online_count,
    incr,
    location_id,
    study_level_projections.autonomous_system_org_id
  FROM study_level_projections
  JOIN aggregates ON aggregates.id = study_level_projections.study_aggregate_id
  WHERE CASE WHEN '${as_orgs:csv}' != '-1' THEN
    study_level_projections.autonomous_system_org_id IN ($as_orgs)
  ELSE 
    true 
  END
), initial_values AS (
  SELECT
    DISTINCT ON (location_id) location_id,
    "time",
    online_count, 
    incr
  FROM filtered_dimensions
  WHERE
    "time" < $__timeFrom()
  ORDER BY location_id, time DESC

), with_initial_count AS (
  SELECT
    $__timeFrom()::timestamp with time zone as "time",
    SUM(online_count) as incr
  FROM initial_values
  GROUP BY 1
  
  UNION

  SELECT
    "time",
    incr
  FROM filtered_dimensions
  WHERE
    $__timeFilter("time")

  UNION

  SELECT
    "time",
    0 AS incr
  FROM base_series

), sum_over AS (
  SELECT
    "time",
    SUM(incr) OVER (ORDER BY "time" ASC) total_online
  FROM (
    SELECT 
      "time", SUM(incr) as incr
    FROM with_initial_count
    GROUP BY 1
  ) t
)

SELECT * FROM sum_over ORDER BY "time" ASC
