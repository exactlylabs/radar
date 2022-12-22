class AddSuperUserToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :super_user, :bool, default: false
  end
end
