SELECT
    '  ' as __text, -1 as __value
WHERE '$level' = 'state'

UNION

SELECT
  name as __text, id as __value
FROM study_aggregates
WHERE
  level = 'state'
  AND study_aggregate = true
  AND ('$level' = 'county' OR '$level' = 'isp_county')

UNION

SELECT
  name as __text, id as __value
FROM study_aggregates
WHERE
  level = 'county'
  AND study_aggregate = true
  AND '$level' = 'census_place'

ORDER BY __text ASC
