class CreateClientEventLogs < ActiveRecord::Migration[6.1]
  def change
    create_table :client_event_logs do |t|
      t.string :name
      t.references :client, foreign_key: true
      t.timestamp :timestamp
      t.jsonb :data

      t.timestamps
    end

    # Any consumer of an event log, needs to store the offset (id of the last event consumed)
    create_table :consumer_offsets do |t| 
      t.string :consumer_id, index: { unique: true }
      t.integer :offset, default: 0
    end

    create_table :client_count_aggregates do |t|
      t.references :aggregator, polymorphic: true
      t.float :online, default: 0
      t.integer :total, default: 0

      t.timestamps
    end

    create_table :client_count_logs do |t|
      t.references :client_count_aggregate, foreign_key: true

      t.float :online
      t.integer :total
      t.string :update_cause
      t.timestamp :timestamp 

      t.timestamps
    end

  end
end
