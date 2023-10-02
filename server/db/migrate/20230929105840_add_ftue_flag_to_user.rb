class AddFtueFlagToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :ftue_disabled, :boolean, default: false
  end
end
