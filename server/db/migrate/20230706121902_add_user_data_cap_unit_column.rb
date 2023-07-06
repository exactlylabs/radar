class AddUserDataCapUnitColumn < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :data_cap_unit, :string, default: "GB"
  end
end
