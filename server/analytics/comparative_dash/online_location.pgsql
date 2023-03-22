with base_series AS (
  SELECT 
    date_trunc('$bucket', dd) as "time"
  FROM generate_series(
    $__timeFrom()::timestamp , $__timeTo()::timestamp, '1 $bucket'::interval
  ) dd
), filtered_dimensions AS (
  SELECT 
    client_count_logs.online,
    aggregator_id,
    CASE WHEN '$dimension' = 'account' THEN
      accounts.name
    WHEN '$dimension' = 'isp' THEN
      autonomous_system_orgs.name
    WHEN '$dimension' = 'location' THEN
      locations.name
    END as "name",
    "timestamp" as "time"
  FROM client_count_logs
  JOIN client_count_aggregates ON client_count_aggregates.id = client_count_logs.client_count_aggregate_id
  JOIN locations ON aggregator_id = locations.id AND aggregator_type = 'Location'
  JOIN clients ON locations.id = clients.location_id
  LEFT JOIN accounts ON accounts.id = locations.account_id
  LEFT JOIN autonomous_systems ON autonomous_systems.id = clients.autonomous_system_id
  LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  WHERE
    CASE WHEN '$dimension' = 'account' THEN
      accounts.id IN ($entities)
    WHEN '$dimension' = 'isp' THEN
      autonomous_systems.id IN ($entities)
    WHEN '$dimension' = 'location' THEN
      locations.id IN ($entities)
    END
), initial_state AS (
  SELECT
    DISTINCT ON (aggregator_id) aggregator_id,
    name,
    "time",
    online
  FROM filtered_dimensions
  WHERE "time" < $__timeFrom()::timestamp
  ORDER BY aggregator_id, "time" DESC
), filled_with_datetime AS (
  SELECT 
    aggregator_id, name, $__timeFrom()::timestamp as "time", online
  FROM initial_state

  UNION

  SELECT aggregator_id, name, "time", MAX(online)
  FROM filtered_dimensions
  WHERE $__timeFilter("time")
  GROUP BY 1, 2, 3

  UNION

  SELECT aggregator_id, name, base_series."time", NULL
  FROM filtered_dimensions, base_series
  GROUP BY 1, 2, 3

), completed_table AS (
  SELECT 
    "time",
    aggregator_id,
    name,
    -- Whenever we find a NULL online field, we get the first value of online field, partitioned by the non_null_count column
    -- Since that count always change when there's a valid value, first_value returns the last valid value
    COALESCE(online, FIRST_VALUE(online) OVER (PARTITION BY aggregator_id, non_null_count ORDER BY "time")) as "online"
  FROM (
    -- Create a new column with the window count of the online value
    -- This count will keep its value until there's a non-null value in the online field, in which it increases by one
    SELECT *, COUNT(online) OVER (PARTITION BY aggregator_id ORDER BY "time") as non_null_count
    FROM filled_with_datetime
  ) t
)



SELECT name, online, "time" FROM completed_table ORDER BY time ASC