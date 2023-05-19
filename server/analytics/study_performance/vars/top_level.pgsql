WITH states AS (
  SELECT DISTINCT ON (geospaces.id) geoid, name, id
  FROM geospaces 
  JOIN study_counties ON geospaces.namespace = 'state' AND study_counties.state_fips = geospaces.geoid

), counties AS (
  SELECT name, geoid, geom, id
  FROM geospaces JOIN study_counties ON study_counties.fips = geoid AND namespace = 'county'
), census_places AS (
  SELECT geospaces.name, geospaces.geoid, geospaces.geom, geospaces.id
  FROM geospaces 
  JOIN counties ON geospaces.namespace = 'census_place' AND ST_INTERSECTS(geospaces.geom, counties.geom)
  JOIN study_counties ON study_counties.fips = counties.geoid
)

SELECT 
  name as __text, id as __value 
FROM geospaces
WHERE 
  '$level' = 'state' 
  AND namespace = 'country' 
  AND geoid = 'US'

UNION 

SELECT 
  name as __text, id as __value 
FROM states
WHERE '$level' = 'county'

UNION

SELECT 
  name as __text, id as __value 
FROM counties
WHERE '$level' = 'census_place'

ORDER BY __text ASC