with selected_ids AS (
  SELECT
    UNNEST('{ ${aggregates:csv} }'::text[]) as id

), selected_study_aggregate_ids AS (
  SELECT
      id::bigint
    FROM selected_ids
    WHERE LEFT(id, 6) != 'other_'
), selected_other_parent_ids AS (
  SELECT
    REPLACE(id, 'other_', '')::bigint as id
  FROM selected_ids
  WHERE LEFT(id, 6) = 'other_'

), aggregates AS (
  SELECT
    study_aggregates.id,
    parent.name as parent_name,
    CASE WHEN parent.name IS NOT NULL THEN
      CONCAT(study_aggregates.name, ' (', parent.name, ')')
    ELSE
      study_aggregates.name
    END as extended_name,
    study_aggregates.study_aggregate
  FROM study_aggregates
  LEFT JOIN study_aggregates parent ON parent.id = study_aggregates.parent_aggregate_id
  WHERE
  study_aggregates.level = '$level'
  AND (
    study_aggregates.id IN (SELECT id FROM selected_study_aggregate_ids)
    OR (study_aggregates.study_aggregate=false AND study_aggregates.parent_aggregate_id IN (SELECT id FROM selected_other_parent_ids))
  )

)


SELECT
    "timestamp" as time,
    extended_name,
    SUM(CASE
      WHEN '$metric' = 'pods' THEN
        online_pods_count
      WHEN '$metric' = 'online_locations' THEN
        online_locations_count
      WHEN '$metric' = 'tests' THEN
        measurements_count
      WHEN '$metric' = 'locations' THEN
        points_with_tests_count
      WHEN '$metric' = 'completed_locations' THEN
        completed_locations_count
    END) as " "
  FROM metrics_projections
  JOIN aggregates ON aggregates.study_aggregate = true AND aggregates.id = metrics_projections.study_aggregate_id
  WHERE
    CASE
      WHEN '${as_orgs:csv}' != '-1' THEN
        metrics_projections.autonomous_system_org_id IN ($as_orgs)
      ELSE
        true
    END AND
    CASE
      WHEN $__timeTo()::timestamp - $__timeFrom()::timestamp < INTERVAL '10 d' THEN
        CASE WHEN '$metric' = 'tests' THEN
          bucket_name = 'hourly'
        ELSE
          bucket_name IS NULL
        END
      WHEN $__timeTo()::timestamp - $__timeFrom()::timestamp < INTERVAL '30 d' THEN
        bucket_name = 'hourly'
      ELSE
        bucket_name = 'daily'
    END AND
      $__timeFilter("timestamp")
  GROUP BY 1, 2

  UNION ALL


  SELECT
    "timestamp",
    CONCAT('Other(', aggregates.parent_name, ')') as extended_name,
    SUM(CASE
    WHEN '$metric' = 'pods' THEN
      online_pods_count
    WHEN '$metric' = 'online_locations' THEN
      online_locations_count
    WHEN '$metric' = 'tests' THEN
      measurements_count
    WHEN '$metric' = 'locations' THEN
      points_with_tests_count
    WHEN '$metric' = 'completed_locations' THEN
      completed_locations_count
    END) as " "
  FROM metrics_projections
  JOIN aggregates ON study_aggregate = false AND aggregates.id = metrics_projections.study_aggregate_id
  WHERE
    CASE
      WHEN '${as_orgs:csv}' != '-1' THEN
        metrics_projections.autonomous_system_org_id IN ($as_orgs)
      ELSE
        true
    END AND
    CASE
      WHEN $__timeTo()::timestamp - $__timeFrom()::timestamp < INTERVAL '10 d' THEN
        CASE WHEN '$metric' = 'tests' THEN
          bucket_name = 'hourly'
        ELSE
          bucket_name IS NULL
        END
      WHEN $__timeTo()::timestamp - $__timeFrom()::timestamp < INTERVAL '30 d' THEN
        bucket_name = 'hourly'
      ELSE
        bucket_name = 'daily'
    END AND
      $__timeFilter("timestamp")
  GROUP BY 1, 2

ORDER BY 1 ASC
