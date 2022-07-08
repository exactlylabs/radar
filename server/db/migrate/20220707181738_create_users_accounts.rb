class CreateUsersAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :users_accounts do |t|
      t.references :account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.datetime :joined_at, null: false
      t.timestamps
    end
  end
end
