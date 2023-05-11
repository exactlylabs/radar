class AddIdColumnToCategoriesLocationsTable < ActiveRecord::Migration[6.1]
  def change
    add_column :categories_locations, :id, :primary_key
  end
end
