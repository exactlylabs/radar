module StudyLevelHandler

  module MeasurementsHandler
      
      private

      def handle_measurement(id, location_id, lonlat, timestamp, as_org_id, as_org_name)
        self.get_aggregates(lonlat, as_org_id, as_org_name).each do |aggregate|
          parent_id = aggregate["parent_id"]
          key = "#{aggregate["level"]}-#{parent_id}-#{aggregate["aggregate_id"]}-#{as_org_id}-#{location_id}-#{lonlat.longitude}-#{lonlat.latitude}"
          last_obj = @cached_projections[key]
          if last_obj.nil?
            last_obj = StudyLevelProjection.latest_for aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, location_id, "measurements"
          end
          if last_obj.nil?
            last_obj = self.new_projection(
              aggregate, lonlat, as_org_id: as_org_id, 
              location_id: location_id, measurement_id: id
            )    
          end

          obj = self.new_record_from_measurement! id, timestamp, last_obj
          @cached_projections[key] = obj
        end
      end

      def handle_speed_test(id, lonlat, timestamp, as_org_id, as_org_name)
        self.get_aggregates(lonlat, as_org_id, as_org_name).each do |aggregate|
          parent_id = aggregate["parent_id"]
          key = "#{aggregate["level"]}-#{parent_id}-#{aggregate["aggregate_id"]}-#{as_org_id}-#{nil}-#{lonlat.longitude}-#{lonlat.latitude}"
          last_obj = @cached_projections[key]
          if last_obj.nil?
            last_obj = StudyLevelProjection.latest_for_with_lonlat aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, lonlat, "measurements"
          end
          if last_obj.nil?
            last_obj = self.new_projection(
              aggregate, lonlat, as_org_id: as_org_id, 
              client_speed_test_id: id
            )  
          end

          obj = self.new_record_from_client_speed_test! id, timestamp, last_obj
          @cached_projections[key] = obj
        end

      end

      def new_record_from_measurement!(id, timestamp, last_obj)
        obj = StudyLevelProjection.from_previous_obj(last_obj)
        obj.measurement_id = id
        obj.timestamp = timestamp
        obj.measurement_count += 1
        obj.measurement_incr = 1
        obj.metric_type = "measurements"
        if last_obj.measurement_count == 0
          obj.points_with_tests_count += 1
          obj.points_with_tests_incr = 1
        end
        obj.save!(:validate => false)
        return obj
      end

      def new_record_from_client_speed_test!(id, timestamp, last_obj)
        obj = StudyLevelProjection.from_previous_obj(last_obj)
        obj.client_speed_test_id = id
        obj.timestamp = timestamp
        obj.measurement_count += 1
        obj.measurement_incr = 1
        obj.metric_type = "measurements"
        if last_obj.measurement_count == 0
          obj.points_with_tests_count += 1
          obj.points_with_tests_incr = 1
        end
        obj.save!(:validate => false)
        return obj
      end
  end
end