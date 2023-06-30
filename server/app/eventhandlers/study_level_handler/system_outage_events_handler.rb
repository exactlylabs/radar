module StudyLevelHandler

  module SystemOutageEventsHandler

    private

    def handle_system_outage_event!(event)
      if event.name == SystemOutage::Events::CREATED
        @in_outage = true

      elsif event.name == SystemOutage::Events::FINISHED
        @in_outage = false
        outage = event.snapshot.state
        # Once a system outage is finished, we search for
        # pods whose state differs from the state before the outage.
        sql = %{
          WITH state_before_outage AS (
            SELECT
              DISTINCT ON (snapshots.aggregate_id) snapshots.aggregate_id,
              (state->>'online')::boolean as online,
              (state->>'account_id')::bigint as account_id,
              (state->>'location_id')::bigint as location_id,
              (state->>'autonomous_system_id')::bigint as autonomous_system_id
            FROM snapshots
            JOIN events ON snapshots.event_id = events.id
            WHERE snapshots.aggregate_type = :client_aggregate_type
            AND timestamp < :start_time
            ORDER BY snapshots.aggregate_id, timestamp DESC
          ), state_right_before_ending AS (
            SELECT
              DISTINCT ON (snapshots.aggregate_id) snapshots.aggregate_id,
              (state->>'online')::boolean as online,
              (state->>'account_id')::bigint as account_id,
              (state->>'location_id')::bigint as location_id,
              (state->>'autonomous_system_id')::bigint as autonomous_system_id
            FROM snapshots
            JOIN events ON snapshots.event_id = events.id
            WHERE snapshots.aggregate_type = :client_aggregate_type
            AND timestamp < :end_time
            ORDER BY snapshots.aggregate_id, timestamp DESC
          )

          SELECT
            f.online as from_online,
            f.account_id as from_account_id,
            f.location_id as from_location_id,
            f.autonomous_system_id as from_autonomous_system_id,
            t.online as to_online,
            t.account_id as to_account_id,
            t.location_id as to_location_id,
            t.autonomous_system_id as to_autonomous_system_id

          FROM state_before_outage f
          RIGHT JOIN state_right_before_ending t ON f.aggregate_id = t.aggregate_id
          WHERE f.online != t.online
        }
        records = ActiveRecord::Base.connection.execute(
          ApplicationRecord.sanitize_sql(
            [sql, {
              start_time: outage["start_time"],
              end_time: outage["end_time"],
              client_aggregate_type: Client.name
            }]
          )
        )
        records.each do |record|
          if record["from_online"]
            self.update_online_count_for_event(event, record["from_location_id"], record["from_autonomous_system_id"], -1)
          end
          if record["to_online"]
            self.update_online_count_for_event(event, record["to_location_id"], record["to_autonomous_system_id"], 1)
          end
        end
      end
    end
  end
end
