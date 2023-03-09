WITH online_status AS (
  SELECT
  timestamp AS "time",
  data->'state'->'online' as value
  FROM client_event_logs
  WHERE 
    timestamp BETWEEN '2023-03-06T11:39:06.204Z' AND '2023-03-08T01:37:17.594Z'
    AND client_id = 443
), initial_status AS (
  SELECT data->'state'->'online' as value
  FROM client_event_logs
  WHERE timestamp < '2023-03-06T11:39:06.204Z' AND client_id = 443
  ORDER BY timestamp DESC 
  LIMIT 1
)

SELECT
  time, value
FROM online_status

UNION
SELECT 
  '2023-03-06T11:39:06.204Z'::timestamp as "time", value
FROM initial_status
ORDER BY time
