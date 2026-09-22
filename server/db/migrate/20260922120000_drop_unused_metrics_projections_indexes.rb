class DropUnusedMetricsProjectionsIndexes < ActiveRecord::Migration[6.1]
  # Concurrent index drops cannot run inside a transaction. They wait for in-flight
  # writes but never block the projection processor's COPY.
  disable_ddl_transaction!

  def up
    # Same key as metrics_projections_agg_timestamp_desc_idx, which a btree can walk in both directions.
    # It was created by hand, so it may be missing in some environments.
    remove_index :metrics_projections, name: 'metrics_projections_agg_timestamp_asc_idx', algorithm: :concurrently, if_exists: true

    # Prefix of the composite indexes that stay.
    remove_index :metrics_projections, name: 'index_metrics_projections_on_study_aggregate_id', algorithm: :concurrently
    remove_index :metrics_projections, name: 'index_metrics_projections_on_autonomous_system_org_id', algorithm: :concurrently
    remove_index :metrics_projections, name: 'index_metrics_projections_on_parent_aggregate_id', algorithm: :concurrently
  end

  def down
    add_index :metrics_projections, :parent_aggregate_id, algorithm: :concurrently
    add_index :metrics_projections, :autonomous_system_org_id, algorithm: :concurrently
    add_index :metrics_projections, :study_aggregate_id, algorithm: :concurrently
    add_index :metrics_projections, [:study_aggregate_id, :timestamp], name: 'metrics_projections_agg_timestamp_asc_idx', algorithm: :concurrently
  end
end
