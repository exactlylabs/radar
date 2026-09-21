module StudyMetricsProjectionProcessor
  module DailyTriggerProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_daily_trigger(date)
      self.process_completed_locations(date)
    end

    # Runs at the start of a day, after every event of the previous day was processed. A location earns
    # a day when it is online now or its last change to online happened on the previous day.
    # days_online grows by at most one per tick, so a threshold is crossed exactly once.
    def process_completed_locations(date)
      @location_metadatas.each do |key, meta|
        next unless meta.online? || (meta.last_online_event_at.present? && meta.last_online_event_at.to_date == date.prev_day)
        meta.days_online += 1
        next unless completion_thresholds.include?(meta.days_online)

        lonlat = location_lonlat(meta.location_id)
        next if lonlat.nil?

        as_org_id = meta.autonomous_system_org_id
        as_org_name = meta.autonomous_system_org&.name
        aggs = self.get_aggregates_for_point(lonlat.longitude, lonlat.latitude, as_org_id, as_org_name, location_id: meta.location_id)
        aggregates_to_count(aggs).each do |aggregate|
          next unless completion_days_for(aggregate) == meta.days_online
          self.update_projection(aggregate, as_org_id, "completed_locations_count", 1)
          # An online location was already counted in completed_and_online when it came online.
          self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", 1) unless meta.online?
        end
      end
    end
  end
end
