module StudyMetricsProjectionProcessor
  module EventsProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_event(event)
      if event["aggregate_type"] == Client.name
        self.handle_client_event! event
      elsif event["aggregate_type"] == SystemOutage.name
        self.handle_system_outage_event! event
      end
    end

    def handle_client_event!(event)
      return if event["snapshot_id"].nil?
      aggregate_id = event["aggregate_id"]
      self.with_previous_pod_state(event["snapshot_state"], aggregate_id, event["timestamp"]) do |previous_state, state|
        online_changed = state["online"] != previous_state&.fetch("online", false)
        location_changed = state["location_id"] != previous_state&.fetch("location_id", nil)
        as_changed = state["autonomous_system_id"] != previous_state&.fetch("autonomous_system_id", nil)

        if (location_changed || as_changed) && state["online"]
          self.decrease_online_count(event, previous_state) if previous_state.present?
          self.increase_online_count(event, state)
        elsif online_changed
          if state["online"]
            self.increase_online_count(event, state)
          elsif previous_state.present?
            self.decrease_online_count(event, state)
          end
        end
      end
    end

    def increase_online_count(event, state)
      return unless state["location_id"].present?
      self.update_online_count_for_location(event["timestamp"], state["location_id"], state["autonomous_system_id"], 1)
    end

    def decrease_online_count(event, state)
      return unless state["location_id"].present?
      self.update_online_count_for_location(event["timestamp"], state["location_id"], state["autonomous_system_id"], -1)
    end

    def handle_system_outage_event!(event)
      if event["name"] == SystemOutage::Events::CREATED
      elsif event["name"] == SystemOutage::Events::FINISHED
        outage = event["snapshot_state"]
        # Once a system outage is finished, we search for
        # pods whose state differs from the state before the outage.
        buckets = ['hourly', 'daily']
        sql = %{
          WITH previous_state AS (
            SELECT
              DISTINCT ON (study_aggregate_id, autonomous_system_org_id) study_aggregate_id, autonomous_system_org_id,
              online_pods_count,
              online_locations_count,
              measurements_count,
              points_with_tests_count,
              completed_locations_count,
              completed_and_online_locations_count

            FROM metrics_projections
            WHERE timestamp < :start_time AND bucket_name = :bucket
            ORDER BY study_aggregate_id, autonomous_system_org_id, timestamp DESC
          )

          UPDATE metrics_projections
          SET
            online_pods_count = previous_state.online_pods_count,
            online_locations_count = previous_state.online_locations_count,
            measurements_count = previous_state.measurements_count,
            points_with_tests_count = previous_state.points_with_tests_count,
            completed_locations_count = previous_state.completed_locations_count,
            completed_and_online_locations_count = previous_state.completed_and_online_locations_count
          FROM previous_state
          WHERE
            metrics_projections.study_aggregate_id = previous_state.study_aggregate_id
            AND metrics_projections.autonomous_system_org_id = previous_state.autonomous_system_org_id
            AND metrics_projections.timestamp >= :start_time
            AND metrics_projections.timestamp < :end_time
            AND metrics_projections.bucket_name = :bucket
        }
        buckets.each do |bucket|
          records = ActiveRecord::Base.connection.execute(
            ApplicationRecord.sanitize_sql(
              [sql, {start_time: outage["start_time"], end_time: outage["end_time"], bucket: bucket}]
            )
          )
        end
      end
    end

    def update_online_count_for_location(timestamp, location_id, autonomous_system_id, incr)
      lonlat = self.location_lonlat(location_id)
      return if lonlat.nil?

      as_org_id, as_org_name = self.as_org_info(autonomous_system_id)

      # Update the location's state.
      # Since our locations snapshots weren't tracking online events, it's safer to derive state from clients snapshots.
      location_meta = self.get_location_metadata(location_id)
      location_was_online = location_meta.online?
      location_meta.online_pods_count += incr
      location_meta.online = location_meta.online_pods_count > 0

      if location_was_online && !location_meta.online?
        location_meta.last_offline_event_at = timestamp

      elsif !location_was_online && location_meta.online?
        location_meta.last_online_event_at = timestamp
        location_meta.autonomous_system_org_id = as_org_id
      end

      # location metadata for a specific asn
      key = "#{location_id}-#{as_org_id}"
      @consumer_offset.state["location_pods_count"] ||= {}
      @consumer_offset.state["location_pods_count"][key] ||= 0

      asn_location_was_online = @consumer_offset.state["location_pods_count"][key] > 0
      @consumer_offset.state["location_pods_count"][key] += incr
      asn_location_is_online = @consumer_offset.state["location_pods_count"][key] > 0

      aggs = self.get_aggregates_for_point(
        lonlat.longitude, lonlat.latitude, as_org_id, as_org_name, location_id: location_id
      )
      study_county = aggs.find {|agg| agg.level == 'county' && agg.study_aggregate}
      aggs.each do |aggregate|
        # Filter out "other" counties from the state_with_study_only level
        if aggregate.level == 'state_with_study_only' && !study_county
          next
        end

        self.update_projection(aggregate, as_org_id, "online_pods_count", incr)
        if asn_location_was_online && !asn_location_is_online
          self.update_projection(aggregate, as_org_id, "online_locations_count", -1)

          # completed_and_online_locations_count should only be decreased if the location's goal isn't completed yet
          if !location_meta.completed?
            self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", -1)
          end

        elsif !asn_location_was_online && asn_location_is_online
          self.update_projection(aggregate, as_org_id, "online_locations_count", 1)

          # completed_and_online_locations_count should only be increased if the location's goal isn't completed yet'
          if !location_meta.completed?
            self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", 1)
          end
        end
      end
    end

    # Compare states with a caching mechanism to avoid duplicated queries
    def with_previous_pod_state(current_state, aggregate_id, timestamp)
      @pod_state ||= {}
      if @pod_state[aggregate_id].nil?
        previous_event = Event.of(Client).where(aggregate_id: aggregate_id).where("timestamp < ?", timestamp).order(:timestamp => :asc, :version => :asc).last
        @pod_state[aggregate_id] = previous_event&.snapshot&.state
      end
      yield @pod_state[aggregate_id], current_state

      @pod_state[aggregate_id] = current_state
    end
  end
end
