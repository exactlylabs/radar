class UpdateWatchdogVersionsJob < ApplicationJob
  queue_as :default

  def perform(update_group)
    clients = update_group.clients
    clients_count = clients.where(has_watchdog: true).count
    updated_count =
      clients
      .where(
        has_watchdog: true,
        target_watchdog_version_id: update_group.watchdog_version_id
      )
      .count

    target =
      (update_group.watchdog_version_rollout_percentage * clients_count / 100).floor
    increment = target - updated_count
    updated_ids = []

    if increment.positive?
      query = clients
              .where(has_watchdog: true)
              .where.not(
                'target_watchdog_version_id IS NOT NULL AND target_watchdog_version_id = ?',
                update_group.watchdog_version_id
              )
              .order('RANDOM()')
              .limit(increment)
      updated_ids = query.pluck(:id)
      query.update(target_watchdog_version_id: update_group.watchdog_version_id)
    elsif increment.negative?
      query = clients
              .where(has_watchdog: true)
              .where(
                'target_watchdog_version_id IS NULL OR target_watchdog_version_id = ?',
                update_group.watchdog_version_id
              )
              .order('RANDOM()')
              .limit(increment.abs)
      updated_ids = query.pluck(:id)
      query.update(target_watchdog_version_id: update_group.old_watchdog_version_id)
    end
    return unless increment != 0

    clients
      .where(id: updated_ids)
      .each { |client| WatchdogChannel.broadcast_version_changed(client) }
  end
end
