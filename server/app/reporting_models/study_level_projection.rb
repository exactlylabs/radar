class StudyLevelProjection < ActiveRecord::Base
  belongs_to :study_aggregate
  belongs_to :autonomous_system_org, optional: true
  belongs_to :location
  belongs_to :parent_aggregate, class_name: 'StudyAggregate', optional: true


  PODS_METRIC = 'pods'
  TESTS_METRIC = 'tests'

  def self.latest_for(level, parent_id, aggregate_id, as_org_id, location_id)
    self.where(
      level: level, 
      parent_aggregate_id: parent_id, 
      study_aggregate_id: aggregate_id, 
      autonomous_system_org_id: as_org_id, 
      location_id: location_id,
    ).last
  end

  def self.latest_for_with_lonlat(level, parent_id, aggregate_id, as_org_id, lonlat)
    self.where(
      level: level, 
      parent_aggregate_id: parent_id, 
      study_aggregate_id: aggregate_id, 
      autonomous_system_org_id: as_org_id, 
      lonlat: lonlat,
      location_id: nil,
    ).last
  end

end