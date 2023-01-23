class CreateLocationLabels < ActiveRecord::Migration[6.1]
  def change
    create_table :location_labels do |t|
      t.string :name

      t.timestamps
    end
  end
end
