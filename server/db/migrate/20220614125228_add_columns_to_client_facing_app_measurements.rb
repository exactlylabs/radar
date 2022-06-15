class AddColumnsToClientFacingAppMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_column :client_facing_app_measurements, :ip, :string
    add_column :client_facing_app_measurements, :token, :string
    add_column :client_facing_app_measurements, :download_id, :string
    add_column :client_facing_app_measurements, :upload_id, :string
  end
end
