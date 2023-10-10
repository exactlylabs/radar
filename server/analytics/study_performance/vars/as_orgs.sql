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
    geospace_id
  FROM study_aggregates
  WHERE
    level = '$level'
    AND (
      id IN (SELECT id FROM selected_study_aggregate_ids)
      OR (study_aggregate=false AND parent_aggregate_id IN (SELECT id FROM selected_other_ids))
    )
)
  SELECT
    as_org.name as __text, as_org.id as __value
  FROM autonomous_system_orgs_geospaces as_org_geo
  JOIN autonomous_system_orgs as_org ON as_org.id = as_org_geo.autonomous_system_org_id
WHERE as_org_geo.geospace_id IN (SELECT geospace_id FROM aggregates)

ORDER BY name ASC
