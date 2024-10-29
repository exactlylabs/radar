class MobileScanNetwork < ApplicationRecord
  belongs_to :found_by_session, class_name: "MobileScanSession"

  has_many :mobile_scan_session_networks
  has_many :mobile_scan_sessions, through: :mobile_scan_session_networks

  enum network_type: {cell: "cell", wifi: "wifi"}

  SECURITIES_REGEXP = /WEP|WPA/

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

    "#{security_type}-#{network_type}"
  end
end
