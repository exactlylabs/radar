class MobileScanNetworkMeasurement < ApplicationRecord
  belongs_to :mobile_scan_network

  scope :where_network_external_id, -> (net_type, net_id) { joins(:mobile_scan_network).where(mobile_scan_network: {network_type: net_type, network_id: net_id}) }
  scope :at_coordinates, -> (lon, lat) { where("ST_Equals(lonlat_before::geometry, ST_SetSRID(ST_Point(?, ?), 4326))", lon, lat) }
  scope :around_location, ->(longitude, latitude, precision) {
    where("ST_Equals(
      ST_SnapToGrid(lonlat_before::geometry, :precision, :precision),
      ST_SnapToGrid(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :precision, :precision)
    )", {lon: longitude, lat: latitude, precision: precision})
  }
end
