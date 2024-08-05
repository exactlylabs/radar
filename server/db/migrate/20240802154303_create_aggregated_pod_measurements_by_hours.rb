class CreateAggregatedPodMeasurementsByHours < ActiveRecord::Migration[6.1]
  def change
    create_view :aggregated_pod_measurements_by_hours, materialized: true
  end
end
