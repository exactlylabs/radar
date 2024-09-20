class AddNetworkLevelTestScheduling < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :scheduling_next_run, :timestamp
    add_reference :locations, :scheduling_selected_client, foreign_key: { to_table: :clients }
    add_column :locations, :scheduling_time_zone, :string, default: "UTC"
    add_column :locations, :scheduling_max_count, :integer, default: 1
    add_column :locations, :scheduling_current_count, :integer, default: 0
    add_column :locations, :scheduling_periodicity, :integer, default: 0
    add_column :locations, :scheduling_current_period_start, :timestamp
    add_column :locations, :scheduling_current_period_end, :timestamp

    add_column :locations, :data_cap_max_usage, :float
    add_column :locations, :data_cap_current_usage, :float, default: 0
    add_column :locations, :data_cap_periodicity, :integer, default: 2
    add_column :locations, :data_cap_current_period, :timestamp

    create_table :scheduling_restrictions do |t|
      t.references :location, foreign_key: true

      t.time :time_start
      t.time :time_end

      t.integer :weekdays, array: true
    end

    reversible do |dir|
      dir.up do
        execute <<-SQL
        UPDATE locations
        SET
          scheduling_periodicity = t.scheduling_periodicity,
          scheduling_max_count = t.scheduling_max_count,
          scheduling_current_count = t.scheduling_current_count,
          scheduling_current_period_end = t.scheduling_current_period_end,
          scheduling_next_run = t.scheduling_next_run,
          data_cap_periodicity = t.data_cap_periodicity,
          data_cap_max_usage = t.data_cap_max_usage,
          data_cap_current_usage = t.data_cap_current_usage,
          data_cap_current_period = t.data_cap_current_period
        FROM (
          SELECT
            locations.id as location_id,
            MIN(clients.scheduling_periodicity) as scheduling_periodicity,
            MAX(clients.scheduling_amount_per_period) as scheduling_max_count,
            SUM(clients.scheduling_tests_in_period) as scheduling_current_count,
            MIN(clients.scheduling_period_end) as scheduling_current_period_end,
            MIN(clients.test_scheduled_at) as scheduling_next_run,
            MIN(clients.data_cap_periodicity) as data_cap_periodicity,
            MAX(clients.data_cap_max_usage)as data_cap_max_usage,
            SUM(clients.data_cap_current_period_usage) as data_cap_current_usage,
            MIN(clients.data_cap_current_period) as data_cap_current_period
          FROM locations
          JOIN clients ON clients.location_id = locations.id
          GROUP BY locations.id
        ) t
        WHERE locations.id = t.location_id
        SQL
      end
    end
  end


end
