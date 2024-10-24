class MobileScanSession < ApplicationRecord
  belongs_to :mobile_user_device

  has_many :mobile_scan_session_networks
  has_many :mobile_scan_networks, through: :mobile_scan_session_networks
  has_many :client_speed_tests
  has_many :mobile_scan_session_posts

  def wifi_networks
    mobile_scan_networks.wifi
  end

  def cell_networks
    mobile_scan_networks.cell
  end

  def speed_tests
    client_speed_tests
  end

end
