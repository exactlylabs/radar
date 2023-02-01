class AddInUseFlagToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :in_service, :boolean, default: false
    add_column :client_count_aggregates, :total_in_service, :integer, default: 0
    add_column :client_count_logs, :total_in_service, :integer, default: 0
  end
end
