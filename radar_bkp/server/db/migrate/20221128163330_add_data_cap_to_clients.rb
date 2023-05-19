class AddDataCapToClients < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :data_cap_max_usage, :float
    add_column :clients, :data_cap_periodicity, :int, default: 2
    add_column :clients, :data_cap_current_period_usage, :float, default: 0.0
    add_column :clients, :data_cap_current_period, "timestamp with time zone"
  end
end
