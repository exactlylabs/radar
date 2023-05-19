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
      query = clients
              .where.not(
                'target_client_version_id IS NOT NULL AND target_client_version_id = ?',
                update_group.client_version_id
              )
              .order('RANDOM()')
              .limit(increment)
      updated_ids = query.pluck(:id)
      query.update_all(target_client_version_id: update_group.client_version_id)
    elsif increment.negative?
      query = clients
              .where(
                'target_client_version_id IS NULL OR target_client_version_id = ?',
                update_group.client_version_id
              )
              .order('RANDOM()')
              .limit(increment.abs)
      updated_ids = query.pluck(:id)
      query.update_all(target_client_version_id: update_group.old_client_version_id)
    end
    return if updated_ids.empty?

    clients
      .where(id: updated_ids)
      .each { |client| PodAgentChannel.broadcast_version_changed(client) }
  end
end
