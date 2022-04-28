class AddClientStatusTracking < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :pinged_at, :datetime
    add_column :clients, :test_requested, :boolean, default: false
  end
end
