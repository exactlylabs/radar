class AddNetworkLevelTestScheduling < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :scheduling_next_run, :timestamp
    add_reference :locations, :scheduling_selected_client, foreign_key: { to_table: :clients }
    add_column :locations, :scheduling_time_zone, :string, default: "UTC"
    add_column :locations, :scheduling_max_count, :integer
    add_column :locations, :scheduling_current_count, :integer
    add_column :locations, :scheduling_periodicity, :integer
    add_column :locations, :scheduling_current_period_start, :timestamp
    add_column :locations, :scheduling_current_period_end, :timestamp

    add_column :locations, :data_cap_max_usage, :float
    add_column :locations, :data_cap_current_usage, :float
    add_column :locations, :data_cap_periodicity, :integer
    add_column :locations, :data_cap_current_period, :timestamp


  end

  create_table :scheduling_restrictions do |t|
    t.references :location, foreign_key: true

    t.time :time_start
    t.time :time_end

    t.integer :weekdays, array: true
  end
end
