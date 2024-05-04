class AddLocationAndCreatedAtIndexToMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_index :measurements, [:location_id, :created_at], order: { created_at: :desc }
  end
end
