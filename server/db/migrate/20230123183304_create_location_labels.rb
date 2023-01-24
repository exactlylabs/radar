class CreateLocationLabels < ActiveRecord::Migration[6.1]
  def change
    create_table :location_labels do |t|
      t.string :name

      t.timestamps
    end
    create_table :location_groups do |t|
      t.string :name
      t.references :location_label, foreign_key: true
      t.references :account, foreign_key: true

      t.timestamps
    end
    add_reference :locations, :location_group, foreign_key: true
  end
end
