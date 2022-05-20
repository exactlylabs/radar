class AddManualLatLongToLocation < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :manual_lat_long, :boolean, default: false
  end
end
