class AddBackfilledFlagToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :backfilled, :boolean, default: false
    add_column :client_speed_tests, :permissions, :jsonb
  end
end
