class Geospace < ApplicationRecord
  scope :where_county, -> { where(namespace: "county") }
  scope :where_census_place, -> { where(namespace: "census_place") }
  scope :with_locations, -> { joins("JOIN locations ON ST_INTERSECTS(ST_SetSRID(locations.lonlat, 4326)::geometry, ST_SetSRID(geospaces.geom, 4326)::geometry)")}

  def locations
    Location.with_geospaces.where("geospaces.id = ?", self.id)
  end
end
