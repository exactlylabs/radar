class CreateCategoriesTableAndCreateLocationCategoriesTable < ActiveRecord::Migration[6.1]
  def change
    rename_table :location_labels, :categories
    
    # categories first as Rails standard is alphabetically ordered
    rename_table :location_labels_locations, :categories_locations

    rename_column :categories_locations, :location_label_id, :category_id

    change_table :categories do |t|
      t.string :color_hex, null: false
    end
    
    change_table :categories_locations do |t|
      t.timestamps
    end
  end
end
