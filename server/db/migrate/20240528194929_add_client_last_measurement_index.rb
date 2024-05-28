class AddClientLastMeasurementIndex < ActiveRecord::Migration[6.1]
  def change
    add_index :measurements, [:client_id, :created_at], where: "(download IS NOT NULL and upload IS NOT NULL)", name: "measurements_not_null_client_id", order: { created_at: :desc }
  end
end
