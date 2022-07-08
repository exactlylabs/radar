class AddAccountIdToClients < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :account_id, :integer
    add_foreign_key :clients, :accounts
  end
end
