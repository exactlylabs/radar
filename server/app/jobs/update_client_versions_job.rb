class UpdateClientVersionsJob < ApplicationJob
  queue_as :default

  def perform(update_group)
    clients = update_group.clients
    clients_count = clients.count
    updated_count =
      clients
      .where(target_client_version_id: update_group.client_version_id)
      .count

    target =
      (update_group.client_version_rollout_percentage * clients_count / 100).floor
    increment = target - updated_count
    updated_ids = []

    if increment.positive?
      clients
        .where.not(
          'target_client_version_id IS NOT NULL AND target_client_version_id = ?',
          update_group.client_version_id
        )
        .order('RANDOM()')
        .limit(increment)
        .each { |client| client.update(target_client_version_id: update_group.client_version_id)}
      return
    elsif increment.negative?
      clients
        .where(
          'target_client_version_id IS NULL OR target_client_version_id = ?',
          update_group.client_version_id
        )
        .order('RANDOM()')
        .limit(increment.abs)
        .each { |client| client.update(target_client_version_id: update_group.old_client_version_id) }
      return
    end
  end
end
