class AddFieldsToClientSpeedTests < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :address, :string
    add_column :client_speed_tests, :network_location, :string
    add_column :client_speed_tests, :city, :string
    add_column :client_speed_tests, :street, :string
    add_column :client_speed_tests, :state, :string
    add_column :client_speed_tests, :postal_code, :string
    add_column :client_speed_tests, :house_number, :integer
    add_column :client_speed_tests, :network_type, :string
    add_column :client_speed_tests, :network_cost, :float
  end
end
