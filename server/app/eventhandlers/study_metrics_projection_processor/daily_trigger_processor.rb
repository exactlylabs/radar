module StudyMetricsProjectionProcessor
  module DailyTriggerProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_daily_trigger(date)
      self.process_completed_locations(date)
    end


    def process_completed_locations(date)
      @consumer_offset.state["locations_state"].each do |location_id, state|
        # Given this is processed at the beginning of the day, this runs only after all events for the previous day
        #  have been processed. Therefore, we check if it either went online at least once, or the last change in state
        #  was online.
        state["state_by_asn"].each do |as_org_id, value|
          value["days_online"] = 0 if !value.include?("days_online")
          if value.fetch("online_at_least_once", false) || value["online?"] == true
            value["days_online"] += 1
          end
          value["online_at_least_once"] = false

          if value["days_online"] >= 90 && !value.fetch("90_day_goal_reached", false)
            value["90_day_goal_reached"] = true
            if @lonlats[location_id].nil?
              begin
                location = Location.with_deleted.find(location_id)
              rescue ActiveRecord::RecordNotFound
                return
              end
              @lonlats[location_id] = location.lonlat
            end
            lonlat = @lonlats[location_id]

            as_org_name = value["as_org_name"]
            aggs = self.get_aggregates_for_point(lonlat, as_org_id, as_org_name, location_id: location_id)
            study_county = aggs.find {|agg| agg.level == 'county' && agg.study_aggregate}
            aggs.each do |aggregate|
              next if aggregate.level == "state" && !study_county
              self.update_projection(aggregate, as_org_id, "completed_locations_count", 1)

              if !value["online?"]
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
end
