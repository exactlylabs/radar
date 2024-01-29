class AddAllowedTimeRangeToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :test_allowed_time_start, :time
    add_column :clients, :test_allowed_time_end, :time
    add_column :clients, :test_allowed_time_tz, :string, default: 'UTC'
  end
end
