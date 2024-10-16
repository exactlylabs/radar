class CreateNetworkStatusHistoryProjection < ActiveRecord::Migration[6.1]
  def change
    create_table :network_status_history_projections do |t|
      t.integer :location_id
      t.references :autonomous_system, foreign_key: true, index: {name: "idx_network_status_history_projections_on_as_id"}
      t.timestamp :started_at
      t.timestamp :finished_at
      t.string :status, null: false
      t.string :reason

      t.index :location_id
    end
  end
end
