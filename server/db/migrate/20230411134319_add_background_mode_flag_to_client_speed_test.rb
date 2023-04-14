class AddBackgroundModeFlagToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :background_mode, :boolean,default: false
  end
end
