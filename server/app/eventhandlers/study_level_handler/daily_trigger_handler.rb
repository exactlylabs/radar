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
        if client["location_id"].nil? || online_locations.include?("#{date.to_s}#{client["location_id"]}")
          next
        end

        as_org_id, as_org_name = self.as_org_info(client["autonomous_system_id"])
        sql = %{
        SELECT * FROM (
          SELECT DATE("timestamp") as dt, MAX(location_online::int)
          FROM study_level_projections
          WHERE
            location_id=:location_id
            AND metric_type='clients_events'
            AND autonomous_system_org_id=:as_org_id
          GROUP BY 1
        ) t
        WHERE dt < :date
        ORDER BY dt DESC LIMIT 1
        }
        records = ActiveRecord::Base.connection.execute(
          ApplicationRecord.sanitize_sql(
            [sql, {
              location_id: client["location_id"],
              as_org_id: as_org_id,
              date: date.prev_day,
            }]
          )
        )


        if records.count != 0 && records[0]["max"] == 1
          begin
            location = Location.with_deleted.find(client["location_id"])
          rescue ActiveRecord::RecordNotFound
            next
          end
          if location.lonlat.nil? && location.longitude.present? && location.latitude.present?
            location.lonlat = "POINT(#{location.longitude} #{location.latitude})"
          end
          return if location.lonlat.nil?
          self.get_aggregates(location.lonlat, as_org_id, as_org_name).each do |aggregate|
            key = "#{aggregate["level"]}-#{aggregate["parent_id"]}-#{aggregate["aggregate_id"]}-#{as_org_id}-#{location.id}-#{location.lonlat.longitude}-#{location.lonlat.latitude}-daily_trigger"
            last_obj = @cached_projections[key]
            if last_obj.nil?
              last_obj = StudyLevelProjection.latest_for(aggregate['level'], aggregate['parent_id'], aggregate['aggregate_id'], as_org_id, location.id, "daily_trigger")
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
          online_locations.add("#{date.to_s}#{client["location_id"]}")
        end
      end
    end

    def record_from_daily_trigger(last_obj, timestamp)
      obj = StudyLevelProjection.from_previous_obj(last_obj)
      obj.timestamp = timestamp
      obj.days_online_count += 1
      obj.metric_type = "daily_trigger"
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
