class WifiConfiguration < ApplicationRecord
  belongs_to :client
  belongs_to :location

  scope :where_enabled, -> { where(enabled: true) }

  validates :enabled, uniqueness: { scope: :location_id, message: "Configuration already enabled for this location." }

  after_commit :broadcast_created, on: :create
  after_commit :broadcast_destroyed, on: :destroy
  after_commit :broadcast_updated, on: :update

  attr_accessor :password

  def broadcast_created
    WatchdogChannel.broadcast_wifi_configuration_created(self, self.password)
  end

  def broadcast_destroyed
    WatchdogChannel.broadcast_wifi_configuration_deleted(self)
  end

  def broadcast_updated
    WatchdogChannel.broadcast_wifi_configuration_updated(self, password: self.password)
  end


end
