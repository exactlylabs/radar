class AddAccounts < ActiveRecord::Migration[6.1]
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
    add_column :locations, :account_id, :integer
    add_foreign_key :locations, :accounts

    add_column :clients, :account_id, :integer
    add_foreign_key :clients, :accounts

    add_column :measurements, :account_id, :integer
    add_foreign_key :measurements, :accounts

    rename_column :locations, :user_id, :created_by_id
    rename_column :clients, :user_id, :claimed_by_id
    rename_column :measurements, :user_id, :measured_by_id
  end
end
