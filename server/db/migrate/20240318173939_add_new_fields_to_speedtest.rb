class AddNewFieldsToSpeedtest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :expected_download_speed, :float, null: true
    add_column :client_speed_tests, :expected_upload_speed, :float, null: true
    add_column :client_speed_tests, :client_first_name, :string, null: true
    add_column :client_speed_tests, :client_last_name, :string, null: true
    add_column :client_speed_tests, :client_email, :string, null: true
    add_column :client_speed_tests, :client_phone, :string, null: true
  end
end
