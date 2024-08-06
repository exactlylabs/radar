class AddOutageTypeToNetworkOutage < ActiveRecord::Migration[6.1]
  def change
    add_column :network_outages, :outage_type, :integer
    add_column :network_outages, :cancelled_at, :datetime
    remove_reference :network_outages, :outage_event
    drop_table :client_outages do |t|
    end
    drop_table :outage_events do |t|
    end
    create_table :isp_outages do |t|
      t.references :autonomous_system, foreign_key: true

      t.datetime :offline_window_start
      t.datetime :offline_window_end
      t.datetime :online_window_start
      t.datetime :online_window_end

      t.datetime :cancelled_at
    end
    add_reference :network_outages, :isp_outage, foreign_key: true
  end
end
