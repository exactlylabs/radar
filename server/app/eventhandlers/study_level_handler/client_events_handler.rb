module StudyLevelHandler
  module ClientEventsHandler

      private

      def handle_event(event)
        if event.aggregate_type == Client.name
          self.handle_client_event! event
        elsif event.aggregate_type == SystemOutage.name
          self.handle_system_outage_event! event
        end
      end

      def handle_client_event!(event)
        if event.snapshot.nil? || @in_outage
          return
        end

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
          self.on_online_event(event, state)
        when Client::Events::WENT_OFFLINE
          self.on_offline_event(event, state)
        end
      end

      def on_online_event(event, state)
        self.update_online_count_for_event(event, state["location_id"], state["autonomous_system_id"], 1)
      end

      def on_offline_event(event, state)
        self.update_online_count_for_event(event, state["location_id"], state["autonomous_system_id"], -1)
      end

      def on_as_changed_event(event, state)
        if state["online"]
          self.update_online_count_for_event(event, state["location_id"], event.data["from"], -1)
          self.update_online_count_for_event(event, state["location_id"], event.data["to"], 1)
        end
      end

      def on_location_changed_event(event, state)
        if state["online"]

          if event.data["from"].present?
            self.update_online_count_for_event(event, event.data["from"], state["autonomous_system_id"], -1)
          end

          if event.data["to"].present?
            self.update_online_count_for_event(event, event.data["to"], state["autonomous_system_id"], 1)
          end
        end
      end

      def update_online_count_for_event(event, location_id, autonomous_system_id, increment)
        begin
          location = Location.with_deleted.find(location_id)
        rescue ActiveRecord::RecordNotFound
          return
        end
        if location.lonlat.nil? && location.longitude.present? && location.latitude.present?
          location.lonlat = "POINT(#{location.longitude} #{location.latitude})"
        end
        return if location.lonlat.nil?

        as_org_id, as_org_name = self.as_org_info(autonomous_system_id)
        self.get_aggregates(location.lonlat, as_org_id, as_org_name).each do |aggregate|
          parent_id = aggregate["parent_id"]
          key = "#{aggregate["level"]}-#{parent_id}-#{aggregate["aggregate_id"]}-#{as_org_id}-#{location.id}-#{location.lonlat.longitude}-#{location.lonlat.latitude}-clients_events"
          last_obj = @cached_projections[key]
          if last_obj.nil?
            last_obj = StudyLevelProjection.latest_for aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, location.id, "clients_events"
          end
          if last_obj.nil?
            last_obj = self.new_projection(
              aggregate, location.lonlat, as_org_id: as_org_id,
              location_id: location.id, event_id: event.id
            )
          end

          if last_obj.present?
            obj = self.new_record_from_event!(last_obj, event, increment=increment)
            @cached_projections[key] = obj
          end
        end
      end

      def as_org_info(autonomous_system_id)
        as_org_id, as_org_name = nil, nil
        if autonomous_system_id.present?
          as_org_id, as_org_name = AutonomousSystem.joins(:autonomous_system_org).where("autonomous_systems.id = ?", autonomous_system_id).pluck(
            "autonomous_system_orgs.id, autonomous_system_orgs.name"
          ).first
        end
        return as_org_id, as_org_name
      end

      def new_record_from_event!(last_obj, event, increment=0)
        obj = StudyLevelProjection.from_previous_obj(last_obj)
        obj.event_id = event.id
        obj.timestamp = event.timestamp
        obj.online_count += increment
        obj.incr = increment
        obj.metric_type = "clients_events"
        if obj.online_count > 0 && !obj.location_online
          obj.location_online = true
          obj.location_online_incr = 1
        elsif obj.online_count == 0 && obj.location_online
          obj.location_online = false
          obj.location_online_incr = -1
        else
          obj.location_online_incr = 0
        end

        obj.save!(:validate => false)
        return obj
      end
  end
end
