SELECT
  name as __text, id::text as __value
FROM study_aggregates
WHERE
  level = '$level'
  AND study_aggregate=true
  AND CASE WHEN '$level' != 'state' THEN
    parent_aggregate_id IN ($top_level_aggregates)
  ELSE
    true
  END

UNION

SELECT CONCAT('Other (', name, ')') as __text, CONCAT('other_', id) as __value
FROM study_aggregates
WHERE id IN ($top_level_aggregates) and '$level' != 'state'

ORDER BY __text ASC
