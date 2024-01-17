class UpdateGroup < ApplicationRecord
  include EventSourceable

  module Events
    CREATED = 'CREATED'
    CLIENT_VERSION_CHANGED = 'CLIENT_VERSION_CHANGED'
    WATCHDOG_VERSION_CHANGED = 'WATCHDOG_VERSION_CHANGED'
  end

  notify_change :client_version_id, Events::CLIENT_VERSION_CHANGED
  notify_change :watchdog_version_id, Events::WATCHDOG_VERSION_CHANGED

  has_many :clients, dependent: :nullify
  belongs_to :client_version, optional: true
  belongs_to :watchdog_version, optional: true
  belongs_to :old_client_version, class_name: 'ClientVersion', optional: true
  belongs_to :old_watchdog_version,
             class_name: 'WatchdogVersion',
             optional: true

  validates :client_version_rollout_percentage,
            numericality: {
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100,
              only_integer: true
            }
  validates :watchdog_version_rollout_percentage,
            numericality: {
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100,
              only_integer: true
            }
  validate do |group|
    if client_version_id_changed? &&
       ![0, 100].include?(client_version_rollout_percentage_was)
      group.errors.add(
        :client_version_rollout_percentage,
        'must be either 0 or 100 when changing the client version'
      )
    end
    if watchdog_version_id_changed? &&
       ![0, 100].include?(watchdog_version_rollout_percentage_was)
      group.errors.add(
        :watchdog_version_rollout_percentage,
        'must be either 0 or 100 when changing the watchdog version'
      )
    end
  end
  before_validation :set_old_version

  after_commit :call_update_jobs

  def set_old_version
    self.old_client_version_id = client_version_id_was if client_version_id_changed?
    return unless watchdog_version_id_changed?

    self.old_watchdog_version_id = watchdog_version_id_was
  end

  def self.default_group
    where(default: true).first
  end

  def pending_rollout?
    rollout_percentage < 100
  end

  private

  def call_update_jobs
    if saved_change_to_client_version_id? || saved_change_to_client_version_rollout_percentage?
      UpdateClientVersionsJob.perform_later self
    end
    return unless saved_change_to_watchdog_version_id || saved_change_to_watchdog_version_rollout_percentage

    UpdateWatchdogVersionsJob.perform_later self
  end
end
