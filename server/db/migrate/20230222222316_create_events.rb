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

  end
end
