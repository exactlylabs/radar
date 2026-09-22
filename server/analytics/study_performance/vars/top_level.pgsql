SELECT
    '  ' as __text, -1 as __value
WHERE '$level' = 'state'

UNION

SELECT
  name as __text, id as __value
FROM study_aggregates
WHERE
  study_id = $study
  AND level = 'state'
  AND study_aggregate = true
  AND ('$level' = 'county' OR '$level' = 'isp_county' OR '$level' = 'zip')

UNION

SELECT
  name as __text, id as __value
FROM study_aggregates
WHERE
  study_id = $study
  AND level = 'county'
  AND study_aggregate = true
  AND ('$level' = 'census_place' OR '$level' = 'census_tract')

ORDER BY __text ASC
