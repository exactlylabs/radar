class CreateClientSpeedTests < ActiveRecord::Migration[6.1]
  def change
    create_table :client_speed_tests do |t|
      t.timestamp :tested_at
      t.float :latitude
      t.float :longitude
      t.float :download_avg
      t.float :upload_avg
      t.string :ip
      t.string :token
      t.string :download_id
      t.string :upload_id
      t.float :latency
      t.float :loss
      t.timestamps
    end
  end
end
