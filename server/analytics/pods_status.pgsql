WITH online_status AS (
  SELECT
  timestamp AS "time",
  state->'online' as value
  FROM snapshots
  JOIN events ON events.id = snapshots.event_id
  WHERE $__timeFilter(timestamp) AND events.aggregate_type = 'Client' AND events.aggregate_id = $clients
  ORDER BY 1 
), initial_status AS (
  SELECT state->'online' as value
  FROM snapshots
  JOIN events ON events.id = snapshots.event_id
  WHERE timestamp < $__timeFrom() AND events.aggregate_type = 'Client' AND events.aggregate_id = $clients
  ORDER BY timestamp DESC 
  LIMIT 1
)

SELECT
  time, value
FROM online_status

UNION
SELECT 
  $__timeFrom() as "time", value
FROM initial_status
ORDER BY time
