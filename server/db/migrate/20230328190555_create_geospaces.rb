class CreateGeospaces < ActiveRecord::Migration[6.1]
  def change
    create_table :geospaces do |t|
      t.string :name
      t.string :namespace
      t.column :geom, :geometry
      t.string :geoid
      t.integer :gid
      t.timestamps
    end
    add_column :locations, :lonlat, :st_point, geographic: true
    Location.all.each do |location|
      location.lonlat = "POINT(#{location.longitude} #{location.latitude})"
      location.save!
    end
  end
end
