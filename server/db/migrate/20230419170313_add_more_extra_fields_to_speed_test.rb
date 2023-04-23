class AddMoreExtraFieldsToSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :alt_accuracy, :float
    add_column :client_speed_tests, :floor, :float
    add_column :client_speed_tests, :heading, :float
    add_column :client_speed_tests, :speed, :float
    add_column :client_speed_tests, :speed_accuracy, :float
  end
end
