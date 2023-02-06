class AddLocationTagToClient < ActiveRecord::Migration[6.1]
  def change
    create_join_table :location_labels, :locations do |t|
      t.index :location_label_id
      t.index :location_id
    end
    remove_reference :location_groups, :location_label
  end
end
