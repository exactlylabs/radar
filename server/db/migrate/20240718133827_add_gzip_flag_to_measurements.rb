class AddGzipFlagToMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_column :measurements, :gzip, :boolean
    add_column :client_speed_tests, :gzip, :boolean
  end
end
