class AddMetadataToMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_column :measurements, :client_version, :string
    add_column :measurements, :client_distribution, :string
  end
end
