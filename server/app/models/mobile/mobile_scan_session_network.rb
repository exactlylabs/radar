class MobileScanSessionNetwork < ApplicationRecord
  belongs_to :mobile_scan_session
  belongs_to :mobile_scan_network

  scope :cell, -> { joins(:mobile_scan_network).where(mobile_scan_network: {network_type: :cell}) }
  scope :wifi, -> { joins(:mobile_scan_network).where(mobile_scan_network: {network_type: :wifi}) }

end