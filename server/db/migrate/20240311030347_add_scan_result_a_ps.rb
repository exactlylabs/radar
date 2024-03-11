class AddScanResultAPs < ActiveRecord::Migration[6.1]
  def change
    create_table :mobile_scan_result_aps do |t|
      t.references :mobile_scan_result, null: false, foreign_key: true

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

      t.timestamps
    end

    remove_column :mobile_scan_results, :bssid
    remove_column :mobile_scan_results, :ssid
    remove_column :mobile_scan_results, :capabilities
    remove_column :mobile_scan_results, :frequency
    remove_column :mobile_scan_results, :center_freq0
    remove_column :mobile_scan_results, :center_freq1
    remove_column :mobile_scan_results, :is80211mc_responder
    remove_column :mobile_scan_results, :channel_width
    remove_column :mobile_scan_results, :is_passpoint_network
    remove_column :mobile_scan_results, :wifi_standard

    add_column :mobile_scan_results, :latitude, :float
    add_column :mobile_scan_results, :longitude, :float
  end
end
