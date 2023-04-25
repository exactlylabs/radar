module StudyLevelHandler
  module DailyTriggerHandler

    private

    def handle_daily_trigger(date)
      online_locations = Set.new
      Snapshot
      .of(Client)
      .prior_to_or_at(date)
      .joins(:event)
      .order("snapshots.aggregate_id, timestamp DESC")
      .select('DISTINCT ON ("snapshots".aggregate_id) snapshots.*, "events".timestamp')
      .each do |snapshot|
        
        client = snapshot.state
        if client["location_id"].nil? || online_locations.include?(client["location_id"])
          next
        end
        
        as_org_id, as_org_name = self.as_org_info(client["autonomous_system_id"])
        if StudyLevelProjection.where(
          autonomous_system_org_id: as_org_id,
          location_id: client["location_id"]
        ).where("DATE(timestamp) = ? AND location_online = true", date.prev_day).exists?
          begin
            location = Location.with_deleted.find(client["location_id"])
          rescue ActiveRecord::RecordNotFound
            next
          end

          self.get_aggregates(location.lonlat, as_org_id, as_org_name).each do |aggregate|
            key = "#{aggregate["level"]}-#{aggregate["parent_id"]}-#{aggregate["aggregate_id"]}-#{as_org_id}-#{location.id}-#{location.lonlat.longitude}-#{location.lonlat.latitude}"
            last_obj = @cached_projections[key]
            if last_obj.nil?
              last_obj = StudyLevelProjection.latest_for(aggregate['level'], aggregate['parent_id'], aggregate['aggregate_id'], as_org_id, location.id)
            end
            if last_obj.nil?
              last_obj = self.new_projection(
                aggregate, location.lonlat, as_org_id: as_org_id,
                location_id: location.id
              )
            end
            obj = record_from_daily_trigger(last_obj, date)
            @cached_projections[key] = obj
          end
          online_locations.add(client["location_id"])
        end
      end
    end

    def record_from_daily_trigger(last_obj, timestamp)
      obj = StudyLevelProjection.from_previous_obj(last_obj)
      obj.timestamp = timestamp
      obj.days_online_count += 1
      if obj.days_online_count == 90 && !obj.location_completed
        obj.completed_locations_count += 1
        obj.completed_locations_incr = 1
        obj.location_completed = true
      end
      obj.save!(validate: false)
      return obj
    end
  end
end