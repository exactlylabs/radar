class StudyAggregate < ActiveRecord::Base
  belongs_to :geospace, optional: true
  belongs_to :study, optional: true
  belongs_to :autonomous_system_org, optional: true
  belongs_to :parent_aggregate, class_name: 'StudyAggregate', optional: true
  has_many :study_aggregates, foreign_key: :parent_aggregate_id
  has_many :study_level_projections
  has_many :study_level_measurements_projections

  scope :having_location_id, ->(location_id) { joins(:geospace => :locations).where("locations.id = ?", location_id) }

  def self.isp_county_name(org_name, county_name)
    "#{org_name} -> #{county_name}"
  end

  # The row identity is (study, level, shape, isp, parent). A shape spanning two parents, such as
  # a census place across two counties, gets one row per parent. Name and the study flag are
  # updated in place, so tagging a shape into a study later flips the existing row instead of adding one.
  def self.find_or_create_for!(study:, level:, geospace_id:, name:, parent:, study_shape:, autonomous_system_org_id: nil)
    aggregate = find_or_initialize_by(
      study_id: study.id, level: level, geospace_id: geospace_id,
      autonomous_system_org_id: autonomous_system_org_id, parent_aggregate_id: parent&.id
    )
    aggregate.name = name
    aggregate.study_aggregate = study_shape
    aggregate.save! if aggregate.new_record? || aggregate.changed?
    aggregate
  end
end

