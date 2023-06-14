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

    return unless increment != 0

    if increment.positive?
      clients
        .where(has_watchdog: true)
        .where.not(
          'target_watchdog_version_id IS NOT NULL AND target_watchdog_version_id = ?',
          update_group.watchdog_version_id
        )
        .order('RANDOM()')
        .limit(increment)
        .each { |client| client.update(target_watchdog_version_id: update_group.watchdog_version_id) }
      return
    elsif increment.negative?
      query = clients
        .where(has_watchdog: true)
        .where(
          'target_watchdog_version_id IS NULL OR target_watchdog_version_id = ?',
          update_group.watchdog_version_id
        )
        .order('RANDOM()')
        .limit(increment.abs)
        .each { |client| client.update(target_watchdog_version_id: update_group.old_watchdog_version_id) }
      return
    end
  end
end
