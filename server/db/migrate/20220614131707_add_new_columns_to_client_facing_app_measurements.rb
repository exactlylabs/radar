class AddNewColumnsToClientFacingAppMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_column :client_facing_app_measurements, :latency, :float
    add_column :client_facing_app_measurements, :loss, :float
  end
end
