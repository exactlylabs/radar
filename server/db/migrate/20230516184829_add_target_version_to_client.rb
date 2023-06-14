class AddTargetVersionToClient < ActiveRecord::Migration[6.1]
  def change
    add_reference :clients, :target_client_version, foreign_key: { to_table: :client_versions }
    add_reference :clients, :target_watchdog_version, foreign_key: { to_table: :watchdog_versions }
    add_column :clients, :has_watchdog, :boolean, default: false
    
    add_reference :update_groups, :old_client_version, foreign_key: { to_table: :client_versions }
    add_reference :update_groups, :old_watchdog_version, foreign_key: { to_table: :watchdog_versions }
    add_column :update_groups, :client_version_rollout_percentage, :int, default: 100
    add_column :update_groups, :watchdog_version_rollout_percentage, :int, default: 100
  end
end
