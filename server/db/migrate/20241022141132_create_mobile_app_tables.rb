class CreateMobileAppTables < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :pods_access, :boolean, default: true
    
    create_table :mobile_user_devices do |t|
      t.references :user
      t.uuid :device_id, index: { unique: true }
      t.string :token

    end

    create_table :mobile_account_settings do |t|
      t.references :user, foreign_key: true, index: { unique: true }
      t.st_point :home_lonlat, geographic: true
      t.float :mobile_monthly_cost
      t.float :fixed_expected_download
      t.float :fixed_expected_upload
      t.float :fixed_monthly_cost

    end

    create_table :mobile_scan_sessions do |t|
      t.references :mobile_user_device, foreign_key: true
      t.timestamps
    end

    create_table :mobile_scan_session_posts do |t|
      t.references :mobile_scan_session, foreign_key: true
      t.timestamp :processed_at
      t.timestamps
    end

    create_table :mobile_scan_networks do |t|
      t.string :network_type
      t.string :network_id, index: { unique: true }
      t.string :name

      t.string :cell_network_type
      t.string :cell_network_data_type
      t.string :cell_channel

      t.string :wifi_security
      t.string :wifi_mac
      t.integer :wifi_channel
      t.integer :wifi_frequency
      
      t.integer :times_seen
      t.timestamp :last_seen_at
      t.timestamp :first_seen_at
      t.st_point :lonlat, geographic: true
      t.float :accuracy
      t.string :address_line1
      t.string :address_line2
      t.references :found_by_session, foreign_key: { to_table: :mobile_scan_sessions }

      t.timestamps
    end

    create_table :mobile_scan_session_networks do |t|
      t.references :mobile_scan_session, foreign_key: true
      t.references :mobile_scan_network, foreign_key: true
      
      t.boolean :is_new, default: false
      t.timestamp :last_seen_at

      t.timestamps
    end

    create_table :mobile_scan_network_measurements do |t|
      t.references :mobile_scan_session_post, foreign_key: true, index: { name: "index_mobile_scan_network_meas_session_id" }
      t.references :mobile_scan_network, foreign_key: true, index: { name: "index_mobile_scan_network_meas_network_id" }
      t.integer :signal_strength
      t.float :noise
      t.float :frequency
      t.timestamp :observed_at
      t.st_point :lonlat_before, geographic: true
      t.float :accuracy_before
      t.st_point :lonlat_after, geographic: true
      t.float :accuracy_after

    end

    create_table :email_verification_codes do |t|
      t.references :mobile_user_device, foreign_key: true
      t.string :reason

      t.string :email
      t.string :code
      t.uuid :device_id
      t.timestamp :valid_until

      t.timestamps
    end

    add_reference :client_speed_tests, :mobile_scan_session, foreign_key: true
  end
end
