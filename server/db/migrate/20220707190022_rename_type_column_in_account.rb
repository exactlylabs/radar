class RenameTypeColumnInAccount < ActiveRecord::Migration[6.1]
  def change
    rename_column :accounts, :type, :account_type
  end
end
