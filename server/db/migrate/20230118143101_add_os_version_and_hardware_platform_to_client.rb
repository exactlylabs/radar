class AddOsVersionAndHardwarePlatformToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :os_version, :string
    add_column :clients, :hardware_platform, :string
  end
end
