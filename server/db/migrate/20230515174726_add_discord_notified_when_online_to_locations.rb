class AddDiscordNotifiedWhenOnlineToLocations < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :notified_when_online, :boolean, default: false
  end
end
