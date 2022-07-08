class AddAccountIdToMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_column :measurements, :account_id, :integer
    add_foreign_key :measurements, :accounts
  end
end
