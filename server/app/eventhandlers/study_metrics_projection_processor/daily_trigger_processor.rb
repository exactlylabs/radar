module StudyMetricsProjectionProcessor
  module DailyTriggerProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_daily_trigger(date)
      self.process_completed_locations(date)
    end


    def process_completed_locations(date)
      state = @consumer_offset.state
      state["locations_id_completed"] ||= {}

      query = %{
        WITH completed_locations AS (
          SELECT location_id, autonomous_system_id, SUM(days) days_online
          FROM (
            SELECT
              dt,
              COALESCE(LEAD(dt, 1) OVER (PARTITION BY location_id, autonomous_system_id ORDER BY dt ASC), DATE(:dt)) - dt as days,
              location_id,
              autonomous_system_id,
              online
            FROM (
              SELECT
                DATE(timestamp) as dt,
                (state->>'location_id')::bigint as location_id,
                (state->>'autonomous_system_id')::bigint as autonomous_system_id,
                MAX((state->>'online')::bool::int) as online
              FROM snapshots
              JOIN events ON events.id = snapshots.event_id
              WHERE
                snapshots.aggregate_type = 'Client' AND
                timestamp < :dt
              GROUP BY 1, 2, 3
            ) t
            ORDER BY dt ASC
          ) tt
          WHERE online = 1
          GROUP BY 1, 2
          HAVING SUM(days) >= 90
        )

        SELECT study_aggregates.id as aggregate_id, study_aggregates.parent_aggregate_id, autonomous_systems.id, COUNT(*)
        FROM completed_locations
        LEFT JOIN autonomous_systems ON autonomous_systems.id = completed_locations.autonomous_system_id
        JOIN geospaces_locations gl ON gl.location_id = completed_locations.location_id
        JOIN geospaces ON geospaces.id = gl.geospace_id
        JOIN study_aggregates ON study_aggregates.geospace_id = geospaces.id AND
          CASE WHEN study_aggregates.autonomous_system_org_id IS NOT NULL THEN study_aggregates.autonomous_system_org_id = autonomous_systems.autonomous_system_org_id ELSE true END
        GROUP BY 1, 2, 3
      }

      records = ActiveRecord::Base.connection.execute(
        ApplicationRecord.sanitize_sql(
          [query, {
            dt: date.to_time
          }]
        )
      )

      # create a map of aggregate_id => StudyAggregate object to call DB only once
      aggregates = StudyAggregate.where(id: records.map { |r| r["aggregate_id"] })
      aggregates_map = {}
      aggregates.each do |aggregate|
        aggregates_map[aggregate.id] = aggregate
      end

      records.each do |record|
        as_org_id, as_org_name = self.as_org_info(record["autonomous_system_id"])
        set_projection(aggregates_map[record["aggregate_id"]], as_org_id, "completed_locations_count", record["count"])
      end
    end
  end
end
