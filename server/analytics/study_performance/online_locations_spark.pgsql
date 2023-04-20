with base_series AS (
  SELECT 
    date_trunc('d', dd) as "time"
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
), selected_other AS (
  SELECT
    study_aggregates.*, 
    CONCAT('Other (', name, ')') as extended_name
  FROM study_aggregates
  WHERE id IN (SELECT id FROM selected_other_ids)
), aggregates AS (
  SELECT 
    study_aggregates.*,
    CASE WHEN parent.name IS NOT NULL THEN
      CONCAT(study_aggregates.name, ' (', parent.name, ')')
    ELSE
      study_aggregates.name
    END as extended_name
  FROM study_aggregates
  LEFT JOIN study_aggregates parent ON parent.id = study_aggregates.parent_aggregate_id
  WHERE 
  study_aggregates.level = '$level'
  AND (
    study_aggregates.id IN (SELECT id FROM selected_study_aggregate_ids) 
    OR (study_aggregates.study_aggregate=false AND study_aggregates.parent_aggregate_id IN (SELECT id FROM selected_other_ids))
  )

), study_only_aggregates AS (
  SELECT *     
  FROM aggregates
  WHERE study_aggregate = true

), non_study_aggregates AS (
  SELECT *
  FROM aggregates
  WHERE 
    study_aggregate = false

), filtered_dimensions AS (
  SELECT
    "timestamp" as "time",
    location_online,
    location_online_diff,
    location_id,
    event_id,
    extended_name,
    study_level_projections.autonomous_system_org_id,
    aggregates.id as aggregate_id,
    aggregates.parent_aggregate_id
  FROM study_level_projections
  JOIN aggregates ON aggregates.id = study_level_projections.study_aggregate_id
  WHERE CASE WHEN '${as_orgs:csv}' != '-1' THEN
    study_level_projections.autonomous_system_org_id IN ($as_orgs)
  ELSE 
    true 
  END
), initial_values AS (
  SELECT
    DISTINCT ON (aggregate_id, location_id, autonomous_system_org_id) aggregate_id, location_id, autonomous_system_org_id,
    extended_name,
    parent_aggregate_id,
    "time",
    location_online::int
  FROM filtered_dimensions
  WHERE
    "time" < $__timeFrom()
  ORDER BY aggregate_id, location_id, autonomous_system_org_id, time DESC
), study_initial_values AS (
  SELECT
    "time",
    aggregate_id,
    extended_name,
    SUM(location_online) as online_locations
  FROM initial_values
  WHERE aggregate_id IN (SELECT id FROM study_only_aggregates)
  GROUP BY 1, 2, 3
), non_study_initial_values AS (
  SELECT
    "time",
    parent_aggregate_id,
    SUM(location_online) as online_locations
  FROM initial_values
  WHERE aggregate_id IN (SELECT id FROM non_study_aggregates)
  GROUP BY 1, 2
  
), with_initial_count AS (
  -- Initial Values for Study Counties
  SELECT
    $__timeFrom()::timestamp with time zone as "time",
    aggregate_id,
    extended_name,
    online_locations as incr
  FROM study_initial_values
  
  UNION

  -- Initial Values for each "Other" parent aggregator
  SELECT
    $__timeFrom()::timestamp with time zone as "time",
    non_study_initial_values.parent_aggregate_id as aggregate_id,
    selected_other.extended_name,
    online_locations as incr
  FROM non_study_initial_values
  JOIN selected_other ON selected_other.id = non_study_initial_values.parent_aggregate_id

  UNION
  
  -- Timestamped values for study counties
  SELECT
    "time",
    aggregate_id,
    extended_name,
    location_online_diff as incr
  FROM filtered_dimensions
  WHERE
    $__timeFilter("time")
    AND aggregate_id IN (SELECT id FROM study_only_aggregates)

  UNION

  -- Timestamped values for "Other" parent aggregators
  SELECT
    "time",
    filtered_dimensions.parent_aggregate_id as aggregate_id,
    selected_other.extended_name,
    location_online_diff as incr
  FROM filtered_dimensions
  JOIN selected_other ON selected_other.id = filtered_dimensions.parent_aggregate_id
  WHERE
    $__timeFilter("time")
    AND filtered_dimensions.aggregate_id IN (SELECT id FROM non_study_aggregates)

  UNION

  -- Empty increments for each date for each study county
  -- to make sure all dates are present
  SELECT
    base_series."time",
    study_only_aggregates.id,
    study_only_aggregates.extended_name,
    0 AS incr
  FROM base_series, study_only_aggregates

  UNION

  SELECT
    base_series."time",
    selected_other.id as aggregate_id,
    selected_other.extended_name,
    0 AS incr
  FROM base_series, selected_other

), sum_over AS (
  SELECT
    "time",
    aggregate_id,
    extended_name,
    SUM(incr) OVER (PARTITION BY aggregate_id ORDER BY "time" ASC) total_online
  FROM (
    SELECT 
      "time", aggregate_id, extended_name, SUM(incr) as incr
    FROM with_initial_count
    GROUP BY 1, 2, 3
  ) t
)

SELECT 
  "time", extended_name, total_online as " "
FROM sum_over 
ORDER BY "time" ASC
