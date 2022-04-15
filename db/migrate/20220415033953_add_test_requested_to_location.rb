class AddTestRequestedToLocation < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :test_requested, :boolean, default: false
  end
end
