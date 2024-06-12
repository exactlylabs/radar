class AddIndexToEvents < ActiveRecord::Migration[6.1]
  def change
    add_index :events, [:aggregate_type, :aggregate_id, :timestamp], order: { timestamp: :desc}, name: 'index_events_on_aggregate_and_timestamp'
    add_index :events, [:aggregate_type, :aggregate_id, :version], order: { version: :desc}, name: 'index_events_on_aggregate_and_version'
    add_index :events, [:timestamp], order: { timestamp: :desc }
    add_index :events, [:aggregate_type, :timestamp], order: { version: :desc }
    add_index :events, [:aggregate_type, :name]
  end
end
