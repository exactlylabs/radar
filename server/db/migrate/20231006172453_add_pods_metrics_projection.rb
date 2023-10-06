class AddPodsMetricsProjection < ActiveRecord::Migration[6.1]
  def change
    create_table :pods_metrics_projection, id: false do |t|
      t.column :timestamp, 'timestamp with time zone'
      t.string :bucket_name, default: nil

      # Dimensions
      t.references :account, foreign_key: true
      t.references :autonomous_system_org, foreign_key: true
      t.references :location, foreign_key: true

      # Pods Metrics
      t.integer :online_pods_count
      t.boolean :location_is_online

      # Measurements Metrics
      t.float :download_med
      t.float :download_min
      t.float :download_max
      t.float :upload_med
      t.float :upload_min
      t.float :upload_max
      t.float :latency_med
      t.float :latency_min
      t.float :latency_max

    end

    # Study Dash is now going to also aggregate by locations.
    add_reference :study_aggregates, :location, foreign_key: true, optional: true
  end
end
