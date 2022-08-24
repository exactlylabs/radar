class AddFieldsToClientSpeedTests < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :address, :string
    add_column :client_speed_tests, :network_location, :string
    add_column :client_speed_tests, :network_type, :string
    add_column :client_speed_tests, :network_cost, :float
  end
end
