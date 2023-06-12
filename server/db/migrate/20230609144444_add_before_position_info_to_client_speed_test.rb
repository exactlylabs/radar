class AddBeforePositionInfoToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :latitude_before, :float
    add_column :client_speed_tests, :longitude_before, :float
    add_column :client_speed_tests, :altitude_before, :float
    add_column :client_speed_tests, :accuracy_before, :float
    add_column :client_speed_tests, :alt_accuracy_before, :float
    add_column :client_speed_tests, :floor_before, :float
    add_column :client_speed_tests, :heading_before, :float
    add_column :client_speed_tests, :speed_before, :float
    add_column :client_speed_tests, :speed_accuracy_before, :float
  end
end

