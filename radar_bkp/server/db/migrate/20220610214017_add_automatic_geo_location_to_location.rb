class AddAutomaticGeoLocationToLocation < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :automatic_location, :boolean, default: false
  end
end
