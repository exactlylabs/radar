class CreateEvents < ActiveRecord::Migration[6.1]
  def change
    create_table :events do |t|
      t.string :name
      t.column :timestamp, "timestamp with time zone"
      t.references :aggregate, polymorphic: true
      t.jsonb :data
      t.bigint :version

      t.timestamps
    end
    add_index :events, [:version, :aggregate_id, :aggregate_type], :unique => true

    
    create_table :snapshots do |t|
      # Snapshots retains the aggregate state in a given time (through the event reference)
      # This enables other consumers to know the correct state of the aggregate at the time
      # No reference to this table should be made, as it is mutable and could be reconstructed anytime

      t.references :event, foreign_key: true
      t.references :aggregate, polymorphic: true
      t.jsonb :state
      t.timestamps
    end
    
    create_table :online_client_count_projections do |t|
      # Dimensions
      t.references :account, foreign_key: true
      t.references :autonomous_system, foreign_key: true
      t.references :location, foreign_key: true

      # Attributes
      t.integer :online, default: 0
      t.integer :total, default: 0
      t.integer :total_in_service, default: 0
      t.column :timestamp, "timestamp with time zone"

      t.references :event, foreign_key: true
    end
  end
end
