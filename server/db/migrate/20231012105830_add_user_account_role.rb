class AddUserAccountRole < ActiveRecord::Migration[6.1]
  def change
    add_column :users_accounts, :role, :integer, default: 0
    remove_column :invites, :role, :integer
    add_column :invites, :role, :integer, default: 0
    change_column_null :invites, :first_name, true
    change_column_null :invites, :last_name, true
  end
end
