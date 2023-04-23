class Geospace < ApplicationRecord
  has_and_belongs_to_many :geospaces

  scope :states, -> { where(namespace: "state") }
  scope :counties, -> { where(namespace: "county") }
  scope :census_places, -> { where(namespace: "census_place") }

  scope :containing_lonlat, -> (lonlat) { where("ST_Contains(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326))") }
  scope :excluding_lonlat, -> (lonlat) { where("NOT ST_Contains(ST_SetSRID(geom, 4326), ST_GeomFromText('POINT(#{lonlat.longitude} #{lonlat.latitude})', 4326))") }
end
