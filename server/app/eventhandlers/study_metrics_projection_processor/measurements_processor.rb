module StudyMetricsProjectionProcessor
  module MeasurementsProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_measurement(id, location_id, lonlat, timestamp, as_org_id, as_org_name)
      self.get_aggregates_for_point(lonlat, as_org_id, as_org_name, location_id: location_id).each do |aggregate|
        update_measurements_count(aggregate, as_org_id, timestamp)
        update_unique_locations_count(aggregate, as_org_id, lonlat)
      end
    end

    def handle_speed_test(id, lonlat, timestamp, as_org_id, as_org_name)
      self.get_aggregates_for_point(lonlat, as_org_id, as_org_name).each do |aggregate|
        update_measurements_count(aggregate, as_org_id, timestamp)
        update_unique_locations_count(aggregate, as_org_id, lonlat)
      end
    end

    def update_unique_locations_count(aggregate, as_org_id, lonlat)
      parent_id = aggregate["parent_id"]
      key = "#{aggregate["aggregate_id"]}-#{as_org_id}-#{lonlat.longitude}-#{lonlat.latitude}"
      @consumer_offset.state["unique-locations-with-tests"] ||= {}

      if @consumer_offset.state["unique-locations-with-tests"][key].nil?
        @consumer_offset.state["unique-locations-with-tests"][key] = true
        self.update_projection(aggregate, as_org_id, "points_with_tests_count", 1)
      end
    end

    def update_measurements_count(aggregate, as_org_id, timestamp)
      self.update_projection(aggregate, as_org_id, "measurements_count", 1, send_to_queue: false)
    end
  end
end
