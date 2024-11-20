class AddMobileUserDeviceToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    remove_reference :client_speed_tests, :user
    add_reference :client_speed_tests, :mobile_user_device, foreign_key: true
  end
end
