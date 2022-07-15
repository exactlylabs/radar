class AddDeletedAtColumnToAccounts < ActiveRecord::Migration[6.1]
  def change
    add_column :accounts, :deleted_at, :timestamp
  end
end
