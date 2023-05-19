class AddAndRenameColumnsToInvitesAndUsersAccounts < ActiveRecord::Migration[6.1]
  def change
    add_column :users_accounts, :invited_at, :timestamp
    rename_column :invites, :user_first_name, :first_name
    rename_column :invites, :user_last_name, :last_name
    rename_column :invites, :user_email, :email
    add_column :invites, :token_digest, :string
  end
end
