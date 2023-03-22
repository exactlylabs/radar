WITH filtered_measurements AS (
  SELECT 
    processed_at as "time",
    download_total_bytes + upload_total_bytes as "total_bytes",
    measurements.account_id,
    accounts.name as "account_name",
    measurements.location_id,
    locations.name as "location_name",
    measurements.client_id,
    clients.name as "client_name",
    autonomous_system_org_id as "isp_id",
    autonomous_system_orgs.name as "isp_name"

  FROM measurements
  JOIN accounts ON account_id = accounts.id
  JOIN locations ON location_id = locations.id
  JOIN clients ON client_id = clients.id
  LEFT JOIN autonomous_systems ON autonomous_systems.id = measurements.autonomous_system_id
  LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  WHERE processed_at BETWEEN '2023-03-16T18:51:33.051Z' AND '2023-03-16T19:21:33.051Z'
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
  END,
  date_trunc('min', "time") as "time",
  SUM(total_bytes) as "Data Used"
FROM filtered_measurements
WHERE
  CASE WHEN '$dimension' = 'account' THEN
    account_id IN ('80')
  WHEN '$dimension' = 'isp' THEN
    isp_id IN ('80')
  WHEN '$dimension' = 'location' THEN
    location_id IN ('80')
  WHEN '$dimension' = 'pod' THEN
    client_id IN ('80')
  END
GROUP BY 1, 2
ORDER BY "time" ASC