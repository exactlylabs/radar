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

  # The row identity is (study, level, shape, isp). Everything else is updated in place,
  # so tagging a shape into a study later flips the existing row instead of adding one.
  # The parent is kept once set: a shape matched by two parents (e.g. a census place spanning
  # two counties) stays under whichever parent claimed it first.
  def self.find_or_create_for!(study:, level:, geospace_id:, name:, parent:, study_shape:, autonomous_system_org_id: nil)
    aggregate = find_or_initialize_by(
      study_id: study.id, level: level, geospace_id: geospace_id, autonomous_system_org_id: autonomous_system_org_id
    )
    aggregate.name = name
    aggregate.parent_aggregate = parent if aggregate.parent_aggregate_id.nil?
    aggregate.study_aggregate = study_shape
    aggregate.save! if aggregate.new_record? || aggregate.changed?
    aggregate
  end
end

