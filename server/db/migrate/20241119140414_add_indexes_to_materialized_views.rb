class AddIndexesToMaterializedViews < ActiveRecord::Migration[6.1]
  def change
    add_index :aggregated_measurements_by_hours, [:account_id, :time]
    add_index :aggregated_measurements_by_hours,
              [:account_id, :autonomous_system_org_id, :location_id, :time],
              unique: true,
              name: "index_aggregated_measurements_by_hours_unique_id"

    add_index :aggregated_measurements_by_days, [:account_id, :time]
    add_index :aggregated_measurements_by_days,
              [:account_id, :autonomous_system_org_id, :location_id, :time],
              unique: true,
              name: "index_aggregated_measurements_by_days_unique_id"

    add_index :aggregated_pod_measurements_by_hours,
              [:account_id, :autonomous_system_org_id, :location_id, :client_id, :time],
              unique: true,
              name: "aggregated_pod_measurements_by_hours_unique_id"

    add_index :aggregated_pod_measurements_by_days,
              [:account_id, :autonomous_system_org_id, :location_id, :client_id, :time],
              unique: true,
              name: "aggregated_pod_measurements_by_days_unique_id"
  end
end
