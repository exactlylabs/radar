class CreateMobileScannedAccessPointTable < ActiveRecord::Migration[6.1]
  def change
    create_table :mobile_scanned_access_points do |t|
      t.string :bssid, null: false, unique: true
      t.string :ssid, null: false
      t.string :capabilities, null: false
      t.integer :frequency, null: false
      t.integer :center_freq0, null: false
      t.integer :center_freq1, null: false
      t.boolean :is80211mc_responder, null: false
      t.integer :channel_width, null: false
      t.boolean :is_passpoint_network, null: false
      t.integer :wifi_standard, null: false

      t.timestamps
    end
  end
end
