class StudyLevelProjection < ActiveRecord::Base
  belongs_to :study_aggregate
  belongs_to :autonomous_system_org, optional: true
  belongs_to :location
  belongs_to :parent_aggregate, class_name: 'StudyAggregate', optional: true

  def self.from_previous_obj(last_obj)
    StudyLevelProjection.new(
      last_obj.attributes.except(
        "id", 
        "timestamp", 
        "event_id", 
        "measurement_id", 
        "client_speed_test_id", 
        "incr", 
        "location_online_incr",
        "measurement_incr",
        "points_with_tests_incr",
        "completed_locations_incr",
      )
    )
  end

  def self.latest_for(level, parent_id, aggregate_id, as_org_id, location_id)
    self.where(
      level: level, 
      parent_aggregate_id: parent_id, 
      study_aggregate_id: aggregate_id, 
      autonomous_system_org_id: as_org_id, 
      location_id: location_id,
    ).order("timestamp DESC").first
  end

  def self.latest_for_with_lonlat(level, parent_id, aggregate_id, as_org_id, lonlat)
    self.where(
      level: level, 
      parent_aggregate_id: parent_id, 
      study_aggregate_id: aggregate_id, 
      autonomous_system_org_id: as_org_id, 
      lonlat: lonlat,
    ).last
  end

end