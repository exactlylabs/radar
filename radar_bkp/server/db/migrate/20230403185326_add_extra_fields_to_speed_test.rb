class AddExtraFieldsToSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :accuracy, :float
    add_column :client_speed_tests, :altitude, :float
    add_column :client_speed_tests, :address_provider, :string
  end
end
