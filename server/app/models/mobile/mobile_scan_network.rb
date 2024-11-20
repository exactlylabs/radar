class MobileScanNetwork < ApplicationRecord
  include VectorTileable

  belongs_to :found_by_session, class_name: "MobileScanSession"

  has_many :mobile_scan_session_networks
  has_many :mobile_scan_sessions, through: :mobile_scan_session_networks

  enum network_type: {cell: "cell", wifi: "wifi"}
  scope :within_box, -> (x_0, y_0, x_1, y_1) {
    where("lonlat::geometry && ST_MakeEnvelope(?, ?, ?, ?, 4326)", x_0, y_0, x_1, y_1)
  }

  SECURITIES_REGEXP = /WEP|WPA/

  def self.from_user(user)
    joins(:mobile_scan_sessions => :mobile_user_device)
    .where(mobile_user_device: {user_id: user.id})
    .group("mobile_scan_networks.id")
  end

  def self.security_from_capabilities(capabilities)
    security_type = case capabilities
      when /WPA3/
        "WPA3"
      when /WPA2/
        "WPA2"
      when /WPA/
        "WPA"
      when /WEP/
        "WEP"
      else
        "Open"
      end

    network_type = case capabilities
      when /-PSK/
        "PSK"
      when /-EAP/
        "EAP"
      else
        ""
      end

    network_type.present? ? "#{security_type}-#{network_type}" : security_type
  end
end
