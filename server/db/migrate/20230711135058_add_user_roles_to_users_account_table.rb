class AddUserRolesToUsersAccountTable < ActiveRecord::Migration[6.1]
  def change
    add_column :users_accounts, :role, :int, default: 2 # Guest
  end
end
