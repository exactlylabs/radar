class MobileScanNetwork < ApplicationRecord
  belongs_to :found_by_session, class_name: "MobileScanSession"
  
  enum type: {cell: "cell", wifi: "wifi"}
end