class AddClientOutagesTableForBackwardCompatibility < ActiveRecord::Migration[6.1]
  def change
    create_table :client_outages do |t|
      t.integer :status, null: false, default: 0
      t.boolean :has_service_started_event, null: false, default: false
      t.references :client, foreign_key: true
      t.references :location, foreign_key: true
      t.references :outage_event, foreign_key: true
      t.references :autonomous_system, foreign_key: true

      # To avoid having permanent ISP outages, we only verify the back online count from the pods that went offline in a specific time-window
      t.boolean :accounted_in_isp_window, null: false, default: false

      t.datetime :started_at
      t.datetime :resolved_at
    end
  end
end
