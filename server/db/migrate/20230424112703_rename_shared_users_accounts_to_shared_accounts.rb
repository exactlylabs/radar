class RenameSharedUsersAccountsToSharedAccounts < ActiveRecord::Migration[6.1]
  def change
    rename_table :shared_users_accounts, :shared_accounts
  end
end
