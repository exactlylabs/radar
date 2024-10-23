class MobileScanSessionPost < ApplicationRecord
  has_one_attached :blob

  belongs_to :mobile_scan_session
end