class CreateGeospaces < ActiveRecord::Migration[6.1]
  def change
    enable_extension 'postgis'
    create_table :geospaces do |t|
      t.string :name
      t.string :namespace
      t.column :geom, :geometry
      t.string :geoid
      t.integer :gid
      t.timestamps
    end
    add_column :locations, :lonlat, :st_point, geographic: true
    create_join_table :geospaces, :locations do |t|
      t.index :geospace_id
      t.index :location_id
    end
  end
end
