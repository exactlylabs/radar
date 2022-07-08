class AddProcessedAtToClientSpeedTests < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :processed_at, :datetime
  end
end
