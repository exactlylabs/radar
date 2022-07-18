class CreateUsersAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :accounts do |t|
      t.integer :account_type, default: 0, null: false
      t.string :name, null: false
      t.boolean :superaccount, default: false
      t.boolean :exportaccount, default: false
      t.datetime :deleted_at
      t.timestamps
    end
    create_table :users_accounts do |t|
      t.references :account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.datetime :joined_at, null: false
      t.datetime :deleted_at
      t.timestamps
    end
    create_table :invites do |t|
      t.boolean :is_active, default: false
      t.string :user_first_name, null: false
      t.string :user_last_name, null: false
      t.string :user_email, null: false
      t.datetime :sent_at, null: false
      t.belongs_to :account, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true
      t.timestamps
    end
  end
end
