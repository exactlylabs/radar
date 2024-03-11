class AddScanFields < ActiveRecord::Migration[6.1]
  def change
    add_column :mobile_scan_results, :session_id, :string
    add_column :mobile_scan_results, :device_data, :jsonb
    add_column :mobile_scan_results, :raw_decoded_message, :jsonb
    add_column :mobile_scan_result_aps, :level, :integer
    add_column :mobile_scan_result_aps, :information_elements, :jsonb
  end
end
