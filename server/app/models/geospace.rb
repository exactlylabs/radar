class Geospace < ApplicationRecord
  STUDY_STATES_FIPS = ['02', '26', '48', '54']
  STUDY_COUNTIES_FIPS = [
    '02016', '02060', '02070', '02180', '02185', '02188', '26051', 
    '26101', '26113', '26119', '26133', '26135', '48107', '48151',
    '48207', '48253', '48279', '48335', '54013', '54015', '54035',
    '54039', '54067', '54085', '54087',
  ]

  has_and_belongs_to_many :locations
  has_many :notified_study_goals

  scope :states, -> { where(namespace: "state") }
  scope :counties, -> { where(namespace: "county") }
  scope :census_places, -> { where(namespace: "census_place") }
  scope :study_geospaces, -> { where(study_geospace: true) }

  scope :containing_lonlat, -> (lonlat) { where("ST_Contains(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326))") }
  scope :excluding_lonlat, -> (lonlat) { where("NOT ST_Contains(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326))") }
end
