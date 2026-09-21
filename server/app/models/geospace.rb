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
  has_and_belongs_to_many :studies
  has_many :notified_study_goals
  has_many :study_aggregates

  scope :states, -> { where(namespace: "state") }
  scope :counties, -> { where(namespace: "county") }
  scope :census_places, -> { where(namespace: "census_place") }
  scope :census_tracts, -> { where(namespace: "census_tract") }
  scope :zips, -> { where(namespace: "zip") }

  scope :containing_lonlat, -> (lonlat) { where("ST_CONTAINS(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326)::geometry)") }
  scope :containing_point, -> (longitude, latitude) { where("ST_CONTAINS(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{longitude} #{latitude})', 4326)::geometry)") }
  scope :excluding_lonlat, -> (lonlat) { where("NOT ST_CONTAINS(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326)::geometry)") }

  after_create :link_to_locations

  def link_to_locations
    Geospace.link_all_locations(Geospace.where(id: id))
  end

  def self.link_all_locations(scope = Geospace.all)
    connection.execute(<<~SQL)
      INSERT INTO geospaces_locations (geospace_id, location_id)
      SELECT geospaces.id, locations.id
      FROM geospaces
      JOIN locations ON ST_Contains(ST_SetSRID(geospaces.geom, 4326), locations.lonlat::geometry)
      WHERE geospaces.id IN (#{scope.select(:id).to_sql})
        AND NOT EXISTS (
          SELECT 1 FROM geospaces_locations
          WHERE geospaces_locations.geospace_id = geospaces.id
            AND geospaces_locations.location_id = locations.id
        )
    SQL
  end

  def study_aggregate_by_level(study, level)
    study_aggregates.find_by(study_id: study.id, level: level)
  end
end
