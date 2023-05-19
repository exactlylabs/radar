class AddFipsToLocation < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :state_fips, :string
    add_column :locations, :county_fips, :string
  end
end
