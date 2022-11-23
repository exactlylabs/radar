class AddSchedulingToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :next_schedule_at, "timestamp with time zone"
    add_column :clients, :cron_string, :string
  end
end
