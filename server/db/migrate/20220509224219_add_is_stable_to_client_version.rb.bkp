class AddIsStableToClientVersion < ActiveRecord::Migration[6.1]
  def change
    add_column :client_versions, :is_stable, :boolean, null: true
    add_index :client_versions, :is_stable, unique: true
  end
end
