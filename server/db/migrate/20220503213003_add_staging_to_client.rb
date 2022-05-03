class AddStagingToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :staging, :boolean, null: true
    add_column :users, :token, :string, null: true
    add_index :users, :token, unique: true
  end
end
