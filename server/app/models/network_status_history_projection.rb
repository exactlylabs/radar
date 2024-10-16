class NetworkStatusHistoryProjection < ApplicationRecord
  belongs_to :location
  belongs_to :autonomous_system, optional: true

  enum status: {went_online: "went_online", went_offline: "went_offline", went_in_service: "went_in_service", not_in_service: "not_in_service"}
  enum reason: {disconnected: "disconnected", restarted: "restarted", system_outage: "system_outage"}

  scope :active, -> { where(finished_at: nil) }
  scope :finished, -> { where.not(finished_at: nil) }
end