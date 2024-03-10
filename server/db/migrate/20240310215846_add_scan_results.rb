class AddScanResults < ActiveRecord::Migration[6.1]
  def change
    create_table :mobile_scan_results do |t|
      t.string :bssid
      t.string :ssid
      t.string :capabilities
      t.integer :frequency
      t.integer :center_freq0
      t.integer :center_freq1
      t.boolean :is80211mc_responder
      t.integer :channel_width
      t.boolean :is_passpoint_network
      t.integer :wifi_standard

      t.timestamp :processed_at

      t.timestamps
    end

    drop_table :mobile_scanned_access_points do |t|

    end
  end
end
