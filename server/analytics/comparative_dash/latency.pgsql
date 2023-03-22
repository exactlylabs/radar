WITH filtered_measurements AS (
  SELECT 
    processed_at as "time",
    latency as "value",
    measurements.account_id,
    accounts.name as "account_name",
    measurements.location_id,
    locations.name as "location_name",
    measurements.client_id,
    clients.name as "client_name",
    autonomous_system_org_id as "isp_id",
    autonomous_system_orgs.name as "isp_name"

  FROM measurements
  LEFT JOIN accounts ON account_id = accounts.id
  LEFT JOIN locations ON location_id = locations.id
  LEFT JOIN clients ON client_id = clients.id
  LEFT JOIN autonomous_systems ON autonomous_systems.id = measurements.autonomous_system_id
  LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  WHERE $__timeFilter(processed_at)
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
  date_trunc('$bucket', "time") as "time",
  CASE 
    WHEN 'AVG' = '$aggregator' THEN
      AVG(value)
    WHEN 'MIN' = '$aggregator' THEN
      MIN(value)
    WHEN 'MAX' = '$aggregator' THEN
      MAX(value)
    WHEN 'MEDIAN' = '$aggregator' THEN
      percentile_disc(0.5) WITHIN GROUP (ORDER BY value)
  END as "$aggregator"
FROM filtered_measurements
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
GROUP BY 1, 2
ORDER BY "time" ASC
