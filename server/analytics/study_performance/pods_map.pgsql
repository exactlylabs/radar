WITH selected_ids AS (
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
    study_aggregates.id, study_aggregates.name, geospaces.geom
  FROM study_aggregates
  JOIN geospaces ON geospaces.id = study_aggregates.geospace_id
  WHERE 
    level = '$level'
    AND (
      study_aggregates.id IN (SELECT id FROM selected_study_aggregate_ids) 
      OR (study_aggregate=false AND parent_aggregate_id IN (SELECT id FROM selected_other_ids))
    )
), matched_locations AS (
  SELECT
    DISTINCT location_id
  FROM study_level_projections
  JOIN aggregates ON aggregates.id = study_level_projections.study_aggregate_id
  WHERE CASE WHEN '${as_orgs:csv}' != '-1' THEN
    study_level_projections.autonomous_system_org_id IN ($as_orgs)
  ELSE 
    true 
  END
)

SELECT
	accounts.name as account_name,
  locations.name as location_name,
  STRING_AGG(clients.name, ', ') as pod_names,
  STRING_AGG(clients.unix_user, ', ') as client_ids,
	locations.latitude,
  locations.longitude,
  BOOL_OR(clients.online) as online
FROM matched_locations
JOIN locations ON locations.id = matched_locations.location_id
JOIN clients ON clients.location_id = locations.id
JOIN accounts ON locations.account_id = accounts.id
JOIN aggregates ON ST_CONTAINS(ST_SetSRID(aggregates.geom, 4326), locations.lonlat::geometry)
GROUP BY
	accounts.name,
  locations.name,
	locations.latitude,
  locations.longitude