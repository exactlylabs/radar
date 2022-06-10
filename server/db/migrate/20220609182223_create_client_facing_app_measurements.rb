class CreateClientFacingAppMeasurements < ActiveRecord::Migration[6.1]
  def change
    create_table :client_facing_app_measurements do |t|
      t.timestamp :tested_at
      t.float :latitude
      t.float :longitude
      t.float :download_avg
      t.float :upload_avg

      t.timestamps
    end
  end
end
