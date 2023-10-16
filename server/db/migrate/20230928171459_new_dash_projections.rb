class NewDashProjections < ActiveRecord::Migration[6.1]
  def change
    create_table :metrics_projections, id: false do |t|
      t.column :timestamp, 'timestamp with time zone'
      t.string :bucket_name, default: nil

      t.references :parent_aggregate
      t.references :study_aggregate, foreign_key: true
      t.references :autonomous_system_org, foreign_key: true

      # Online Pods Metric: Number of pods online
      t.integer :online_pods_count, default: 0

      # Online Locations Metric:
      t.integer :online_locations_count, default: false

      # Tests Metric: Number of measurements taken
      t.integer :measurements_count, default: 0

      # Locations Metric: Number of unique locations (lonlat) with at least one speed test (from widget or pods)
      t.integer :points_with_tests_count, default: 0

      t.integer :completed_locations_count, default: 0

    end
    add_foreign_key :metrics_projections, :study_aggregates, column: :parent_aggregate_id, primary_key: :id
    add_index :metrics_projections, [:study_aggregate_id, :timestamp], order: {timestamp: :desc}, name: 'metrics_projections_agg_timestamp_desc_idx'
    add_index :metrics_projections, [:study_aggregate_id, :autonomous_system_org_id, :bucket_name, :timestamp], order: {timestamp: :desc}, name: 'metrics_projections_agg_asn_bucket_timestamp_desc_idx'
    add_index :metrics_projections, [:study_aggregate_id, :bucket_name, :timestamp], order: {timestamp: :desc}, name: 'metrics_projections_agg_bucket_timestamp_desc_idx'
    add_index :geospaces, "st_setsrid(geom, 4326)", using: 'GIST'

  end
end
