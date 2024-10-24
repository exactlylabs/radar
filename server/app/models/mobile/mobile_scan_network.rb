class MobileScanNetwork < ApplicationRecord
  belongs_to :found_by_session, class_name: "MobileScanSession"
  
  has_many :mobile_scan_session_networks
  has_many :mobile_scan_sessions, through: :mobile_scan_session_networks
  
  enum network_type: {cell: "cell", wifi: "wifi"}
end