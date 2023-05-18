class UpdateGroup < ApplicationRecord
    include EventSourceable

    module Events
        CREATED = "CREATED"
        CLIENT_VERSION_CHANGED = "CLIENT_VERSION_CHANGED"
        WATCHDOG_VERSION_CHANGED = "WATCHDOG_VERSION_CHANGED"
    end

    notify_change :client_version_id, Events::CLIENT_VERSION_CHANGED
    notify_change :watchdog_version_id, Events::WATCHDOG_VERSION_CHANGED

    has_many :clients, dependent: :nullify
    belongs_to :client_version, optional: true
    belongs_to :watchdog_version, optional: true
    belongs_to :old_client_version, class_name: "ClientVersion", optional: true
    belongs_to :old_watchdog_version, class_name: "WatchdogVersion", optional: true

    validates :client_version_rollout_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100, only_integer: true }
    validates :watchdog_version_rollout_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100, only_integer: true }
    validate do |group|
        if client_version_id_changed? && ![0, 100].include?(client_version_rollout_percentage_was)
            group.errors.add(:client_version_rollout_percentage, "must be either 0 or 100 when changing the client version")
        end
        if watchdog_version_id_changed? && ![0, 100].include?(watchdog_version_rollout_percentage_was)
            group.errors.add(:watchdog_version_rollout_percentage, "must be either 0 or 100 when changing the watchdog version")
        end
    end
    before_validation :set_old_version

    after_save :ensure_client_rollout_percentage!, if: Proc.new {|client| saved_change_to_client_version_id || saved_change_to_client_version_rollout_percentage }
    after_save :ensure_watchdog_rollout_percentage!, if: Proc.new {|client| saved_change_to_watchdog_version_id || saved_change_to_watchdog_version_rollout_percentage }
    
    def set_old_version
        if self.client_version_id_changed?
            self.old_client_version_id = self.client_version_id_was
        end
        if self.watchdog_version_id_changed?
            self.old_watchdog_version_id = self.watchdog_version_id_was
        end
    end

    def self.default_group
        self.where(default: true).first
    end

    def pending_rollout?
        self.rollout_percentage < 100
    end

    def ensure_client_rollout_percentage!
        clients_count = self.clients.count()
        updated_count = self.clients.where(target_client_version_id: self.client_version_id).count()
        
        target = (self.client_version_rollout_percentage * clients_count / 100).floor
        increment = target - updated_count
        if increment > 0
            self.clients.where.not(
                "target_client_version_id IS NOT NULL AND target_client_version_id = ?", self.client_version_id
            )
            .order("RANDOM()")
            .limit(increment)
            .update_all(target_client_version_id: self.client_version_id)
        elsif increment < 0
            self.clients.where(
                "target_client_version_id IS NULL OR target_client_version_id = ?", self.client_version_id
            )
            .order("RANDOM()")
            .limit(increment.abs)
            .update_all(target_client_version_id: self.old_client_version_id)
        end
        if increment != 0
            self.clients.where("target_client_version_id IS NOT NULL AND target_client_version_id != client_version_id").each do |client|
                PodAgentChannel.broadcast_version_changed(client)
            end
        end
    end

    def ensure_watchdog_rollout_percentage!
        clients_count = self.clients.where(has_watchdog: true).count()
        updated_count = self.clients.where(has_watchdog: true, target_watchdog_version_id: self.watchdog_version_id).count()

        target = (self.watchdog_version_rollout_percentage * clients_count / 100).floor
        increment = target - updated_count
        if increment > 0
            self.clients.where(has_watchdog: true).where.not(
                "target_watchdog_version_id IS NOT NULL AND target_watchdog_version_id = ?", self.watchdog_version_id
            )
            .order("RANDOM()")
            .limit(increment)
            .update(target_watchdog_version_id: self.watchdog_version_id)
        elsif increment < 0
            self.clients.where(
                "target_watchdog_version_id IS NULL OR target_watchdog_version_id = ?", self.watchdog_version_id
            )
            .order("RANDOM()")
            .limit(increment.abs)
            .update(target_watchdog_version_id: self.old_watchdog_version_id)
        end
        if increment != 0
            self.clients.where("target_watchdog_version_id IS NOT NULL AND target_watchdog_version_id != watchdog_version_id").each do |client|
                WatchdogChannel.broadcast_version_changed(client)
            end
        end
    end

end
