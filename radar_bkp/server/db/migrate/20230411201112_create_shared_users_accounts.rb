class CreateSharedUsersAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :shared_users_accounts do |t|
      t.references :original_account, null: false, foreign_key: { to_table: :accounts }
      t.references :shared_to_account, null: false, foreign_key: { to_table: :accounts }
      t.datetime :deleted_at
      t.datetime :shared_at, null: false
      t.timestamps
    end
  end
end
