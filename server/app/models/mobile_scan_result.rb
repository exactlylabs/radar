class MobileScanResult < ApplicationRecord
  has_one_attached :binary_message
  has_many :mobile_scan_result_aps

end
