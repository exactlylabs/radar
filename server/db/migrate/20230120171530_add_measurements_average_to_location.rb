class AddMeasurementsAverageToLocation < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :download_avg, :float
    add_column :locations, :upload_avg, :float
  end
end
