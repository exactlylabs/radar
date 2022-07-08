class AddAccountIdToLocations < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :account_id, :integer
    add_foreign_key :locations, :accounts
  end
end
