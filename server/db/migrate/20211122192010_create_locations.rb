class CreateLocations < ActiveRecord::Migration[6.1]
  def change
    create_table :locations do |t|
      t.string :name
      t.string :address
      t.float :latitude
      t.float :longitude
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_reference :measurements, :location, foreign_key: true
    add_reference :clients, :location, foreign_key: true
  end
end
