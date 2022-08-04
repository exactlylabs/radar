class ChangePermissionsToAccounts < ActiveRecord::Migration[6.1]
  def change
    add_column :accounts, :token, :string
    remove_column :users, :superuser
    remove_column :users, :exportuser
    remove_column :users, :token
  end
end
