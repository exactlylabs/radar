class AddSessionIdToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :session_id, :string
  end
end
