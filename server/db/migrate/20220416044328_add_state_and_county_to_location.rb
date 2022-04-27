class AddStateAndCountyToLocation < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :state, :string
    add_column :locations, :county, :string
  end
end
