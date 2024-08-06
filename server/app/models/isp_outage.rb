class IspOutage < ApplicationRecord
  has_many :network_outages
  belongs_to :autonomous_system

  default_scope -> { where(cancelled_at: nil) }

end
