module StudyMetricsProjectionProcessor
  module DailyTriggerProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_daily_trigger(date)
      self.process_completed_locations(date)
    end


    def process_completed_locations(date)
      # Given this is processed at the beginning of the day, this runs only after all events for the previous day
      #  have been processed. Therefore, we check if it either went online at least once, or the last change in state
      #  was online.
      @location_metadatas.each do |key, meta|
        if meta.online? || (meta.last_online_event_at.present? && meta.last_online_event_at.to_date == date.prev_day)
          meta.days_online += 1
        end

        if meta.days_online >= 90 && !meta.completed?
          meta.completed = true

          if @lonlats[meta.location_id].nil?
            begin
              location = Location.with_deleted.find(meta.location_id)
            rescue ActiveRecord::RecordNotFound
              return
            end
            @lonlats[meta.location_id] = location.lonlat
          end
          lonlat = @lonlats[meta.location_id]

          as_org_name = meta.autonomous_system_org&.name
          as_org_id = meta.autonomous_system_org_id

          aggs = self.get_aggregates_for_point(lonlat, as_org_id, as_org_name, location_id: meta.location_id)
          study_county = aggs.find {|agg| agg.level == 'county' && agg.study_aggregate}
          aggs.each do |aggregate|
            next if aggregate.level == "state" && !study_county
            self.update_projection(aggregate, as_org_id, "completed_locations_count", 1)

            if !meta.online?
              # In case the location wasn't online, we increase the count, otherwise it was already increased due
              # to it being online and its goal wasn't completed at the time.
              self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", 1)
            end
          end
        end
      end
    end
  end
end
