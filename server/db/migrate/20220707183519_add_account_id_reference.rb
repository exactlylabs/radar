class AddAccountIdToLocations < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :account_id, :integer
    add_foreign_key :locations, :accounts

    add_column :clients, :account_id, :integer
    add_foreign_key :clients, :accounts

    add_column :measurements, :account_id, :integer
    add_foreign_key :measurements, :accounts
  end
end
