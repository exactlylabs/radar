class AddMeasurementExternalIds < ActiveRecord::Migration[6.1]
  def change
    add_column :measurements, :download_id, :string
    add_column :measurements, :upload_id, :string
  end
end
