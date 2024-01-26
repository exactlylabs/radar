class AddWifiDataToMeasurement < ActiveRecord::Migration[6.1]
  def change
    # remove_column :clients, :network_interfaces
    create_table :pod_network_interfaces do |t|
      t.references :client, null: false, foreign_key: true
      t.string :name
      t.string :mac_address
      t.jsonb :ips
      t.boolean :wireless, default: false
      t.boolean :default, default: false

      t.index [:client_id, :name], unique: true
    end

    # # 1:1 relationship with client, will hold all informations on the pod connectivity
    create_table :pod_connectivity_configs do |t|
      t.references :client, null: false, foreign_key: true, unique: true
      t.references :wlan_interface, foreign_key: { to_table: :pod_network_interfaces }
      t.boolean :wlan_enabled, default: false
      t.string :selected_ssid
      t.string :current_ssid
      t.boolean :wlan_connected, default: false

    end

    add_column :measurements, :wireless, :boolean
    add_column :measurements, :interface, :string
    add_column :measurements, :signal, :integer
    add_column :measurements, :tx_speed, :integer
    add_column :measurements, :frequency, :integer
    add_column :measurements, :channel, :integer
    add_column :measurements, :width, :string
    add_column :measurements, :noise, :integer

  end
end
