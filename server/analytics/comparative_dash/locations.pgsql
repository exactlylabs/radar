WITH extended_locations AS (
  SELECT
    clients.id as client_id,
    clients.name as client_name,
    accounts.id as account_id,
    accounts.name as account_name,
    locations.id as location_id,
    locations.name as location_name,
    autonomous_system_orgs.id as isp_id,
    autonomous_system_orgs.name as isp_name,
    
    locations.latitude,
    locations.longitude,
    clients.online as online
  FROM locations
  JOIN clients ON clients.location_id = locations.id
  JOIN accounts ON locations.account_id = accounts.id
  LEFT OUTER JOIN autonomous_systems ON autonomous_systems.id = clients.autonomous_system_id
  LEFT OUTER JOIN autonomous_system_orgs ON autonomous_systems.autonomous_system_org_id = autonomous_system_orgs.id::int
)

SELECT
  CASE WHEN '$dimension' = 'account' THEN
    account_name
  WHEN '$dimension' = 'isp' THEN
    isp_name
  WHEN '$dimension' = 'location' THEN
    location_name
  WHEN '$dimension' = 'pod' THEN
    client_name
  END as "Entity",
  latitude,
  longitude,
  BOOL_OR(online) as online
FROM extended_locations
WHERE
  CASE WHEN '$dimension' = 'account' THEN
    account_id IN ($entities)
  WHEN '$dimension' = 'isp' THEN
    isp_id IN ($entities)
  WHEN '$dimension' = 'location' THEN
    location_id IN ($entities)
  WHEN '$dimension' = 'pod' THEN
    client_id IN ($entities)
  END
GROUP BY
  1, 2, 3
