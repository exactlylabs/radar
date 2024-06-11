class ModifyMeasurementsIndex < ActiveRecord::Migration[6.1]
  def change
    remove_index :measurements, name: "measurements_not_null_client_id"
    add_index :measurements, [:account_id, :client_id, :created_at], where: "(download IS NOT NULL AND upload IS NOT NULL)", name: "measurements_on_account_client_not_null", order: { created_at: :desc }
    add_index :measurements, [:location_id, :created_at], where: "(download IS NOT NULL AND upload IS NOT NULL)", name: "measurements_on_location_values_not_null", order: { created_at: :desc }
  end
end
