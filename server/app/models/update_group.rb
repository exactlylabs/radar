class UpdateGroup < ApplicationRecord
    has_many :clients, dependent: :nullify
    belongs_to :client_version, optional: true
    belongs_to :watchdog_version, optional: true

    after_save :send_broadcasts

    def self.default_group
        self.where(default: true).first
    end

    def send_broadcasts()
        if saved_change_to_client_version_id
            PodAgentChannel.broadcast_update_group_version_changed self
        end
        if saved_change_to_watchdog_version_id
            WatchdogChannel.broadcast_update_group_version_changed self
        end
    end
end
