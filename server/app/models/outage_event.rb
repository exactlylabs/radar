class OutageEvent < ApplicationRecord
  has_many :client_outages
  belongs_to :autonomous_system_org, optional: true

  enum status: { active: 0, cancelled: 1, resolved: 2 }
  enum outage_type: { pod_failure: 1, isp_outage: 2, power_outage: 3 }

end
