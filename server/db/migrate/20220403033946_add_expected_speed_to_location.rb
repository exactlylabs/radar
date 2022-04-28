class AddExpectedSpeedToLocation < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :expected_mbps_up, :decimal
    add_column :locations, :expected_mbps_down, :decimal
  end
end
