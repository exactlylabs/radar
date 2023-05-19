class AddExtendedMeasurementInfo < ActiveRecord::Migration[6.1]
  def change
    add_column :measurements, :extended_info, :jsonb
  end
end
