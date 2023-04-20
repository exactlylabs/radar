
WITH duplicated_events AS (
  SELECT
    *
  FROM (
  SELECT
    *, 
    LAG(name, 1) OVER (PARTITION BY aggregate_id ORDER BY timestamp ASC) as prev_event,
    LAG(aggregate_id, 1) OVER (PARTITION BY aggregate_id ORDER BY timestamp ASC) as prev_agg,
    LAG(id, 1) OVER (PARTITION BY aggregate_id ORDER BY timestamp ASC) as prev_event_id,
    LAG(data, 1) OVER (PARTITION BY aggregate_id ORDER BY timestamp ASC) as prev_data
  FROM events
  ) t
  WHERE 
    aggregate_type = 'Client'
    AND name = prev_event AND aggregate_id = prev_agg AND data = prev_data
    AND name IN ('WENT_ONLINE', 'WENT_OFFLINE', 'LOCATION_CHANGED', 'AUTONOMOUS_SYSTEM_CHANGED', 'CREATED')
)
SELECT * FROM duplicated_events

-- DELETE FROM snapshots WHERE event_id IN (SELECT id FROM duplicated_events);
-- DELETE FROM online_client_count_projections WHERE event_id IN (SELECT id FROM duplicated_events);
-- DELETE FROM study_level_projections WHERE event_id IN (SELECT id FROM duplicated_events)
-- DELETE FROM events WHERE ID IN (SELECT id FROM duplicated_events)