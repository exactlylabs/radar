WITH top_level AS (
  SELECT 
    id, geom, geoid, name
  FROM geospaces
  WHERE id IN ($top_level)

), top_level_aggregators AS (
  SELECT
    geospaces.id, 
    ST_INTERSECTION(geospaces.geom, top_level.geom) as geom, 
    geospaces.geoid, 
    geospaces.name, 
    top_level.id as top_level_id,
    top_level.name as top_level_name
  FROM geospaces
  JOIN top_level ON ST_INTERSECTS(top_level.geom, geospaces.geom)
  WHERE geospaces.namespace = '$level'

), study_counties_ext AS (
  SELECT
    study_counties.*, geospaces.geom, geospaces.id as geom_id
  FROM study_counties
  JOIN geospaces ON geospaces.namespace = 'county' AND study_counties.fips = geospaces.geoid

), selected_ids AS (
  SELECT 
    UNNEST('{ ${aggregator:csv} }'::text[]) as id

), other_ids AS (
  SELECT
    REPLACE(id, 'other_', '')::bigint as id
  FROM selected_ids
  WHERE LEFT(id, 6) = 'other_'

), aggregator_ids AS (
  SELECT
    id::bigint
  FROM selected_ids
  WHERE LEFT(id, 6) != 'other_'

), aggregators AS (
  SELECT 
    top_level_aggregators.id, 
    top_level_aggregators.geoid, 
    top_level_aggregators.name,
    top_level_aggregators.top_level_id,
    top_level_aggregators.top_level_name,
    top_level_aggregators.geom
  FROM top_level_aggregators
  JOIN aggregator_ids ON aggregator_ids.id = top_level_aggregators.id

), non_study_aggregators AS (
  -- inside aggregators, there's fake ids with the format other_<top_level_id>
  SELECT
    aggr.id, 
    aggr.geoid, 
    aggr.name,
    aggr.top_level_id,
    aggr.top_level_name,
    geom
  FROM top_level_aggregators aggr
  WHERE 
    aggr.top_level_id IN (SELECT id FROM other_ids)
    AND aggr.id NOT IN (SELECT id FROM aggregators)

), all_aggregators AS (
  SELECT * FROM aggregators
  UNION
  SELECT * FROM non_study_aggregators
)

SELECT
    accounts.name AS account_name,
    locations.name AS location_name,
    all_aggregators.name,
    all_aggregators.top_level_name
    --locations.id AS location_id
FROM locations
JOIN accounts ON locations.account_id = accounts.id
-- Exclude locations without any clients
JOIN clients ON clients.location_id = locations.id
JOIN all_aggregators ON ST_CONTAINS(ST_SetSRID(all_aggregators.geom, 4326), locations.lonlat::geometry)
WHERE 
  CASE WHEN '$include_other' = 'no' THEN 
    all_aggregators.id IN (SELECT id FROM aggregator_ids) 
  ELSE
    true
  END
GROUP BY locations.id, locations.name, all_aggregators.name, all_aggregators.top_level_name, accounts.name
HAVING COUNT(*) FILTER (WHERE clients.online) = 0