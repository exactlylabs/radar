class AddShippedToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :shipped, :boolean, null: true, default: nil
  end
end
