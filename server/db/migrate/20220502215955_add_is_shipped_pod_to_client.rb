class AddIsShippedPodToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :is_shipped_pod, :boolean, null: true
    add_column :clients, :shipped, :boolean, null: true
  end
end
