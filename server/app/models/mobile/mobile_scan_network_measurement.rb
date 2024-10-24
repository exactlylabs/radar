class MobileScanNetworkMeasurement < ApplicationRecord
  belongs_to :mobile_scan_session_post
  belongs_to :mobile_scan_network
  
end