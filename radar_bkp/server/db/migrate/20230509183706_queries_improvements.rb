class QueriesImprovements < ActiveRecord::Migration[6.1]
  def change
    add_column :study_level_projections, :metric_type, :string
    
    add_index :study_level_projections, :metric_type
    add_index :study_level_projections, [:metric_type, :timestamp], order: {timestamp: :desc}

    # Measurements Indexes
    add_index :measurements, :processed_at, order: {processed_at: :desc}
    add_index :measurements, :account_id
    add_index :measurements, [:account_id, :processed_at], order: {processed_at: :desc}
    add_index :measurements, [:processed_at, :location_id, :autonomous_system_id], name: "idx_meas_filter_by_loc_and_isp", order: {processed_at: :desc} # Optimizes Pods Dash Variables

    # Location Indexes
    add_index :locations, :account_id
    
  end
end
