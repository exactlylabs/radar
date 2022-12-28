class AddCustomSchedulingEnabledToClients < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :custom_scheduling, :boolean, default: false
  end
end
