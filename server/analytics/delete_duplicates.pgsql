
WITH client_events AS (
  SELECT * FROM events WHERE aggregate_type='Client' AND name IN ('WENT_ONLINE', 'WENT_OFFLINE')
), with_previous AS (
  SELECT
      client_events.*, 
      LAG(name, 1) OVER (PARTITION BY aggregate_id, aggregate_type ORDER BY timestamp ASC) as prev_event
      
    FROM client_events
), duplicates AS (
  SELECT id, name, prev_event, aggregate_id, timestamp
  FROM with_previous
  WHERE 
    name = prev_event
)

SELECT * FROM duplicates
ORDER BY timestamp ASC

-- DELETE FROM snapshots WHERE event_id IN (SELECT id FROM duplicates);
-- DELETE FROM online_client_count_projections WHERE event_id IN (SELECT id FROM duplicates);
-- DELETE FROM study_level_projections WHERE event_id IN (SELECT id FROM duplicates)
-- DELETE FROM events WHERE ID IN (SELECT id FROM duplicates)