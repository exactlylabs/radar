module StudyMetricsProjectionProcessor
  module EventsProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_event(event)
      if event.aggregate_type == Client.name
        self.handle_client_event! event
      elsif event.aggregate_type == SystemOutage.name
        self.handle_system_outage_event! event
      end
    end

    def handle_client_event!(event)
      last_agg_event = @last_event_of_aggregate["#{event.aggregate_type}_#{event.aggregate_id}"]
      @last_event_of_aggregate["#{event.aggregate_type}_#{event.aggregate_id}"] = event

      state = event.snapshot.state
      case event.name
      when Client::Events::CREATED
        if state["online"]
          self.on_online_event(event, state)
        end
      when Client::Events::LOCATION_CHANGED
        self.on_location_changed_event(event, state)
      when Client::Events::AS_CHANGED
        self.on_as_changed_event(event, state)
      when Client::Events::WENT_ONLINE
        if @in_outage || last_agg_event.present? && last_agg_event.name == Client::Events::WENT_ONLINE
          return
        end
        self.on_online_event(event, state)
      when Client::Events::WENT_OFFLINE
        if @in_outage || last_agg_event.present? && last_agg_event.name == Client::Events::WENT_OFFLINE
          return
        end
        self.on_offline_event(event, state)
      end
    end

    def on_online_event(event, state)
      self.update_online_count_for_location(state["location_id"], state["autonomous_system_id"], 1)
    end

    def on_offline_event(event, state)
      self.update_online_count_for_location(state["location_id"], state["autonomous_system_id"], -1)
    end

    def on_location_changed_event(event, state)
      if state["online"]

        if event.data["from"].present?
          self.update_online_count_for_location(event.data["from"], state["autonomous_system_id"], -1)
        end

        if event.data["to"].present?
          self.update_online_count_for_location(event.data["to"], state["autonomous_system_id"], 1)
        end
      end
    end

    def on_as_changed_event(event, state)
      if state["online"]
        self.update_online_count_for_location(state["location_id"], event.data["from"], -1)
        self.update_online_count_for_location(state["location_id"], event.data["to"], 1)
      end
    end

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
            self.update_online_count_for_location(record["from_location_id"], record["from_autonomous_system_id"], -1)
          end
          if record["to_online"]
            self.update_online_count_for_location(record["to_location_id"], record["to_autonomous_system_id"], 1)
          end
        end
      end
    end

    def update_online_count_for_location(location_id, autonomous_system_id, incr)
      if @lonlats[location_id].nil?
        begin
          location = Location.with_deleted.find(location_id)
        rescue ActiveRecord::RecordNotFound
          return
        end
        @lonlats[location_id] = location.lonlat
      end
      lonlat = @lonlats[location_id]

      as_org_id, as_org_name = self.as_org_info(autonomous_system_id)

      # Update the location's state.
      # Since our locations snapshots weren't tracking online events, it's safer to derive state from clients snapshots.
      # Given we're storing this as a json object, all keys MUST be strings.
      if @consumer_offset.state["locations_state"][location_id.to_s].nil?
        @consumer_offset.state["locations_state"][location_id.to_s] = {}
      end
      location_state = @consumer_offset.state["locations_state"][location_id.to_s]
      if location_state["online_pods_count_by_asn"].nil?
        location_state["online_pods_count_by_asn"] = {}
      end

      if location_state["online_pods_count_by_asn"][as_org_id.to_s].nil?
        location_state["online_pods_count_by_asn"][as_org_id.to_s] = 0
      end

      asn_location_was_online = location_state["online_pods_count_by_asn"][as_org_id.to_s] > 0

      location_state["online_pods_count_by_asn"][as_org_id.to_s] += incr

      asn_location_is_online = location_state["online_pods_count_by_asn"][as_org_id.to_s] > 0

      if location_state["state_by_asn"].nil?
        location_state["state_by_asn"] ||= {}
      end
      if location_state["state_by_asn"][as_org_id.to_s].nil?
        location_state["state_by_asn"][as_org_id.to_s] = {}
      end
      location_asn_state = location_state["state_by_asn"][as_org_id.to_s]

      location_asn_state["online?"] = asn_location_is_online
      location_asn_state["online_at_least_once"] = asn_location_is_online || location_asn_state.fetch("online_at_least_once", false)
      location_asn_state["as_org_name"] = as_org_name

      aggs = self.get_aggregates_for_point(lonlat, as_org_id, as_org_name, location_id: location_id)
      study_county = aggs.find {|agg| agg.level == 'county' && agg.study_aggregate}
      aggs.each do |aggregate|
        # Filter out "other" counties from the state level
        if aggregate.level == 'state' && !study_county
          next
        end

        self.update_projection(aggregate, as_org_id, "online_pods_count", incr)
        if asn_location_was_online && !asn_location_is_online
          self.update_projection(aggregate, as_org_id, "online_locations_count", -1)

          # completed_and_online_locations_count should only be decreased if the location's goal isn't completed yet
          if !location_asn_state.fetch("90_day_goal_reached", false)
            self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", -1)
          end

        elsif !asn_location_was_online && asn_location_is_online
          self.update_projection(aggregate, as_org_id, "online_locations_count", 1)

          # completed_and_online_locations_count should only be increased if the location's goal isn't completed yet'
          if !location_asn_state.fetch("90_day_goal_reached", false)
            self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", 1)
          end
        end
      end
    end
  end
end
