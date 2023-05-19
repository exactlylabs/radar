class AddDayOfMonthToClients < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :data_cap_day_of_month, :integer, default: 1 # Use -1 to last day of the month
  end
end
