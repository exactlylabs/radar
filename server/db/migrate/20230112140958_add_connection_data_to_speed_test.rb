class AddConnectionDataToSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :connection_data, :jsonb
  end
end
