module StudyLevelHandler

  module MeasurementsHandler
      
      private

      def handle_measurement(id, location_id, lonlat, timestamp, as_org_id, as_org_name)
        self.get_aggregates(lonlat, as_org_id, as_org_name).each do |aggregate|
          parent_id = aggregate["parent_id"]
          dimension_key = "#{aggregate["level"]}, #{parent_id}, #{aggregate["aggregate_id"]}, #{as_org_id}, #{location_id}"
          last_obj = @last_objs[dimension_key]
          if last_obj.nil?
            last_obj = StudyLevelProjection.latest_for aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, location_id
          end
          if last_obj.nil?
            last_obj = StudyLevelProjection.new(
              level: aggregate["level"],
              parent_aggregate_id: parent_id,
              study_aggregate_id: aggregate["aggregate_id"],
              autonomous_system_org_id: as_org_id,
              location_id: location_id,
              lonlat: lonlat,
              measurement_id: id,
            )        
          end

          obj = self.new_record_from_measurement! id, timestamp, last_obj
          @last_objs[dimension_key] = obj
        end
      end

      def handle_speed_test(id, lonlat, timestamp, as_org_id, as_org_name)
        self.get_aggregates(lonlat, as_org_id, as_org_name).each do |aggregate|
          parent_id = aggregate["parent_id"]
          dimension_key = "#{aggregate["level"]}, #{parent_id}, #{aggregate["aggregate_id"]}, #{as_org_id}"
          last_obj = @last_objs[dimension_key]
          if last_obj.nil?
            last_obj = StudyLevelProjection.latest_for_with_lonlat aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, lonlat
          end
          if last_obj.nil?
            last_obj = StudyLevelProjection.new(
              level: aggregate["level"],
              parent_aggregate_id: parent_id,
              study_aggregate_id: aggregate["aggregate_id"],
              autonomous_system_org_id: as_org_id,
              lonlat: lonlat,
              client_speed_test_id: id,
            )
          end

          obj = self.new_record_from_client_speed_test! id, timestamp, last_obj
          @last_objs[dimension_key] = obj
        end

      end

      def new_record_from_measurement!(id, timestamp, last_obj)
        obj = StudyLevelProjection.from_previous_obj(last_obj)
        obj.measurement_id = id
        obj.timestamp = timestamp
        obj.measurement_count += 1
        obj.measurement_incr = 1
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
        if last_obj.measurement_count == 0
          obj.points_with_tests_count += 1
          obj.points_with_tests_incr = 1
        end
        obj.save!(:validate => false)
        return obj
      end
  end
end