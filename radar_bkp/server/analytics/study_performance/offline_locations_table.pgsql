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
    CASE WHEN parent.name IS NOT NULL THEN
      CONCAT(study_aggregates.name, ' (', parent.name, ')')
    ELSE
      study_aggregates.name
    END as name,
    study_aggregates.id,
    geom

  FROM study_aggregates
  LEFT JOIN study_aggregates parent ON parent.id = study_aggregates.parent_aggregate_id
  JOIN geospaces ON geospaces.id = study_aggregates.geospace_id
  WHERE 
    study_aggregates.level = '$level'
    AND (
      study_aggregates.id IN (SELECT id FROM selected_study_aggregate_ids) 
      OR (study_aggregates.study_aggregate=false AND study_aggregates.parent_aggregate_id IN (SELECT id FROM selected_other_ids))
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
	accounts.name as "Account",
  locations.name as "Location Name",
  aggregates.name as "Aggregate"

FROM matched_locations
JOIN locations ON locations.id = matched_locations.location_id
JOIN clients ON clients.location_id = locations.id
JOIN accounts ON locations.account_id = accounts.id
JOIN aggregates ON ST_CONTAINS(ST_SetSRID(aggregates.geom, 4326), locations.lonlat::geometry)
GROUP BY
	1, 2, 3
HAVING COUNT(*) FILTER (WHERE clients.online) = 0
ORDER BY accounts.name ASC, aggregates.name ASC