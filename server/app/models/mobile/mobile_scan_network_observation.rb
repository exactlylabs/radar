class MobileScanNetworkObservation < ApplicationRecord
  belongs_to :mobile_scan_session
  belongs_to :mobile_scan_network
  
end