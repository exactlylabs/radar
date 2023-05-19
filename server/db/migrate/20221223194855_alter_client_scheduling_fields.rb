class AlterClientSchedulingFields < ActiveRecord::Migration[6.1]
  def change
    remove_column :clients, :cron_string, :string
    remove_column :clients, :next_schedule_at, "timestamp with time zone"

    # Configuration Fields
    add_column :clients, :scheduling_periodicity, :int, default: 0
    add_column :clients, :scheduling_amount_per_period, :int, default: 1
    
    # Internal Fields
    add_column :clients, :scheduling_tests_in_period, :int, default: 0
    add_column :clients, :scheduling_period_end, "timestamp with time zone"
    add_column :clients, :test_scheduled_at, "timestamp with time zone"
  end
end
