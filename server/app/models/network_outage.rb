class NetworkOutage < ApplicationRecord
  belongs_to :location
  belongs_to :isp_outage, optional: true
  belongs_to :autonomous_system, optional: true

  enum status: { active: 0, cancelled: 1, resolved: 2 }
  enum outage_type: { unknown_reason: 0, network_failure: 1, isp_outage: 2, power_outage: 3 }

  scope :where_active, -> { where(status: :active) }
  scope :where_resolved, -> { where(status: :resolved) }
end
