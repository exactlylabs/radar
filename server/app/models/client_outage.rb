class ClientOutage < ApplicationRecord
  belongs_to :client
  belongs_to :location
  belongs_to :outage_event, optional: true
  belongs_to :autonomous_system, optional: true

  enum status: { active: 0, cancelled: 1, resolved: 2 }

  scope :where_active, -> { where(status: :active) }
  scope :where_resolved, -> { where(status: :resolved) }
end
