WITH base_series AS (
  SELECT 
    date_trunc('$bucket', dd) as "time"
  FROM generate_series(
    $__timeFrom()::timestamp , $__timeTo()::timestamp, '1 $bucket'::interval
  ) dd
), top_level AS (
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
    top_level.id as top_level_id
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
    geom
  FROM top_level_aggregators aggr
  WHERE 
    aggr.top_level_id IN (SELECT id FROM other_ids)
    AND aggr.id NOT IN (SELECT id FROM aggregators)

), all_aggregators AS (
  SELECT * FROM aggregators
  UNION
  SELECT * FROM non_study_aggregators

), filtered_dimensions AS (
  SELECT 
    online_client_count_projections.id,
    online,
    CASE WHEN online > 0 AND COALESCE(LAG(online, 1) OVER lag_window, 0) <= 0 THEN 
      1 
    WHEN online <= 0 AND COALESCE(LAG(online, 1) OVER lag_window, 0) > 0 THEN
      -1
    ELSE 
      0
    END AS incr,
    online_client_count_projections.account_id, 
    autonomous_system_id, 
    location_id, 
    locations.lonlat,
    all_aggregators.id as aggregator_id,
    all_aggregators.top_level_id as top_level_id,
    timestamp as "time"
  FROM online_client_count_projections
  LEFT JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
  LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  JOIN locations ON locations.id = location_id
  JOIN all_aggregators ON ST_CONTAINS(ST_SetSRID(all_aggregators.geom, 4326), locations.lonlat::geometry)
  WINDOW lag_window AS (PARTITION BY (online_client_count_projections.account_id, autonomous_system_id, location_id) ORDER BY online_client_count_projections.id)

), windowed_sum AS (
  SELECT
    "time",
    aggregator_id,
    top_level_id,
    SUM(incr) OVER (PARTITION BY (aggregator_id, top_level_id) ORDER BY "time") as "total_online"
  FROM filtered_dimensions
  WHERE aggregator_id IN (SELECT id FROM aggregator_ids)

), non_study_grouped AS (
  SELECT
    "time",
    top_level_id,
    SUM(incr) OVER (PARTITION BY top_level_id ORDER BY "time") as "total_online"
  FROM filtered_dimensions
  WHERE aggregator_id IN (SELECT id FROM non_study_aggregators)

), table_with_base_series  AS (
  SELECT 
    "time", 
    aggregators.id as aggregator_id, 
    aggregators.top_level_id,
    NULL as total_online 
  FROM base_series, aggregators
  
  UNION

  SELECT "time", aggregator_id as aggregator_id, top_level_id, total_online FROM windowed_sum

  UNION 

  SELECT "time", -1 as aggregator_id, top_level_id, total_online FROM non_study_grouped

  UNION

  SELECT "time", -1 as aggregator_id, top_level_id, NULL as total_online FROM base_series, non_study_aggregators
  
), completed_table AS (
  SELECT 
    "time",
    aggregator_id,
    top_level_id,
    -- Whenever we find a NULL online field, we get the first value of online field, partitioned by the non_null_count column
    -- Since that count always change when there's a valid value, first_value returns the last valid value
    COALESCE(total_online, FIRST_VALUE(total_online) OVER (PARTITION BY aggregator_id, top_level_id, non_null_count ORDER BY "time")) as "total_online"
  FROM (
    -- Create a new column with the window count of the online value
    -- This count will keep its value until there's a non-null value in the online field, in which it increases by one
    SELECT *, COUNT(total_online) OVER (PARTITION BY aggregator_id, top_level_id ORDER BY "time") as non_null_count
    FROM table_with_base_series
  ) t
)

SELECT 
  "time", 
  COALESCE(total_online, 0) as " ", 
  CASE WHEN completed_table.aggregator_id = -1 THEN
    CONCAT('Other', ' (', top_level.name, ')')
  ELSE
    CONCAT(aggregators.name, ' (', top_level.name, ')')
  END as "county" 
FROM completed_table
LEFT JOIN aggregators ON aggregators.id = completed_table.aggregator_id
LEFT JOIN top_level ON top_level.id = completed_table.top_level_id::bigint
ORDER BY "time" ASC