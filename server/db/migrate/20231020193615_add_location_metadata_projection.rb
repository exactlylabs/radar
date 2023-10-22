class AddLocationMetadataProjection < ActiveRecord::Migration[6.1]
  def change
    create_table :location_metadata_projections do |t|
      t.references :location, foreign_key: true, index: { unique: true }
      t.references :autonomous_system_org, foreign_key: true

      t.integer :online_pods_count, default: 0
      t.integer :days_online, default: 0
      t.boolean :completed, default: false
      t.boolean :online, default: false
      t.column :last_offline_event_at, "timestamp with time zone"
      t.column :last_online_event_at, "timestamp with time zone"

    end
  end
end
