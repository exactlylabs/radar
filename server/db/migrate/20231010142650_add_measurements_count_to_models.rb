class AddMeasurementsCountToModels < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :measurements_count, :bigint, default: 0
    add_column :locations, :measurements_download_sum, :float, default: 0
    add_column :locations, :measurements_upload_sum, :float, default: 0

    add_column :clients, :measurements_count, :bigint, default: 0
    add_column :clients, :measurements_download_sum, :float, default: 0
    add_column :clients, :measurements_upload_sum, :float, default: 0

  end
end
