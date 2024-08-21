class AddWifiConfig < ActiveRecord::Migration[6.1]
  def change
    # Location
    add_column :locations, :wlan_enabled, :boolean
    add_reference :locations, :wlan_selected_client, foreign_key: { to_table: :clients }

    # Wifi Configuration
    create_table :wifi_configurations do |t|
      t.references :client, foreign_key: true
      t.references :location, foreign_key: true

      t.string :ssid, null: false
      t.string :security # WEP / WPA2 / WPA2Enterprise / ...
      t.string :identity # For Enterprise types
      t.boolean :hidden, default: false
      t.boolean :enabled

      t.index [:enabled, :location_id], unique: true # Can only have one enabled wifi per location
    end

    # Renamed Pod Connectivity Config -> Pod Connections + adjustments to fields
    drop_table :pod_connectivity_configs
    create_table :pod_connections do |t|
      t.references :client

      t.integer :ethernet_status
      t.integer :wlan_status
      t.string :current_ssid

      t.float :wlan_signal
      t.float :wlan_frequency
      t.float :wlan_channel
      t.float :wlan_link_speed
    end
  end
end
