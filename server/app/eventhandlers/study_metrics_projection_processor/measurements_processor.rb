module StudyMetricsProjectionProcessor
  module MeasurementsProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_measurement(id, location_id, longitude, latitude, timestamp, as_org_id, as_org_name)
      aggs = self.get_aggregates_for_point(longitude, latitude, as_org_id, as_org_name, location_id: location_id)
      aggregates_to_count(aggs).each do |aggregate|
        update_measurements_count(aggregate, as_org_id, timestamp)
        update_unique_locations_count(timestamp, aggregate, as_org_id, longitude, latitude)
      end
    end

    def handle_speed_test(id, longitude, latitude, timestamp, as_org_id, as_org_name)
      aggs = self.get_aggregates_for_point(longitude, latitude, as_org_id, as_org_name)
      aggregates_to_count(aggs).each do |aggregate|
        update_measurements_count(aggregate, as_org_id, timestamp)
        update_unique_locations_count(timestamp, aggregate, as_org_id, longitude, latitude)
      end
    end

    def update_unique_locations_count(timestamp, aggregate, as_org_id, longitude, latitude)
      key = "#{aggregate.id}-#{as_org_id}-#{longitude}-#{latitude}"
      @consumer_offset.state["unique-locations-with-tests"] ||= {}

      if @consumer_offset.state["unique-locations-with-tests"][key].nil?
        @consumer_offset.state["unique-locations-with-tests"][key] = true
        self.update_projection(aggregate, as_org_id, "points_with_tests_count", 1)
      end
    end

    def update_measurements_count(aggregate, as_org_id, timestamp)
      self.update_projection(aggregate, as_org_id, "measurements_count", 1)
    end
  end
end
