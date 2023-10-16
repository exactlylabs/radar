class Geospace < ApplicationRecord
  STUDY_STATES_FIPS = ['02', '26', '48', '54']
  STUDY_COUNTIES_FIPS = [
    '02016', '02060', '02070', '02180', '02185', '02188', '26051',
    '26101', '26113', '26119', '26133', '26135', '48107', '48151',
    '48207', '48253', '48279', '48335', '54013', '54015', '54035',
    '54039', '54067', '54085', '54087',
  ]

  has_and_belongs_to_many :locations
  has_and_belongs_to_many :autonomous_system_orgs
  has_many :notified_study_goals
  has_many :study_aggregates

  scope :states, -> { where(namespace: "state") }
  scope :counties, -> { where(namespace: "county") }
  scope :census_places, -> { where(namespace: "census_place") }
  scope :study_geospaces, -> { where(study_geospace: true) }

  scope :containing_lonlat, -> (lonlat) { where("ST_Contains(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326))") }
  scope :excluding_lonlat, -> (lonlat) { where("NOT ST_Contains(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326))") }

  after_create :link_to_locations

  def link_to_locations()
    Location.joins("JOIN geospaces ON ST_Contains(ST_SetSRID(geospaces.geom, 4326), ST_SetSRID(locations.lonlat::geometry, 4326))").where("geospaces.id = ?", self.id).each do |location|
      self.locations << location unless self.locations.include? location
    end
  end

  def self.update_all_locations_links()
    Geospace.all.each do |geospace|
      geospace.link_to_locations
    end
  end

  def study_aggregate_by_level(level)
    self.study_aggregates.where(level: level).first
  end
end
