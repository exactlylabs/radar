with parent as (
  SELECT
    *
  FROM geospaces
  WHERE id IN ($top_level)
), study_counties_ext AS (
  SELECT
    study_counties.*, geospaces.geom, geospaces.id as geom_id
  FROM study_counties
  JOIN geospaces ON geospaces.namespace = 'county' AND study_counties.fips = geospaces.geoid
), aggregator AS (
  SELECT
    geospaces.*
  FROM geospaces
  JOIN parent ON ST_INTERSECTS(parent.geom, geospaces.geom)
  JOIN study_counties_ext ON 
    CASE WHEN '$level' = 'county' THEN
      geospaces.id = study_counties_ext.geom_id
    ELSE
      ST_INTERSECTS(study_counties_ext.geom, geospaces.geom)
    END
  WHERE
    CASE WHEN '$level' = 'state' THEN
      geospaces.namespace = 'state'
    WHEN '$level' = 'county' THEN
      geospaces.namespace = 'county'
    WHEN '$level' = 'census_place' THEN
      geospaces.namespace = 'census_place'
    END
)

SELECT
  DISTINCT(aggregator.id)::text AS __value, aggregator.name as __text
FROM aggregator

UNION

SELECT
  CONCAT('other_', parent.id) AS __value,
  CONCAT('Other (', parent.name, ')') AS __text
FROM parent
WHERE CASE WHEN '$level' != 'state' THEN true END

ORDER BY __text ASC

