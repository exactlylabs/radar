class AddAfterPositionInfoToClientSpeedTests < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :latitude_after, :float
    add_column :client_speed_tests, :longitude_after, :float
    add_column :client_speed_tests, :altitude_after, :float
    add_column :client_speed_tests, :accuracy_after, :float
    add_column :client_speed_tests, :alt_accuracy_after, :float
    add_column :client_speed_tests, :floor_after, :float
    add_column :client_speed_tests, :heading_after, :float
    add_column :client_speed_tests, :speed_after, :float
    add_column :client_speed_tests, :speed_accuracy_after, :float
  end
end
