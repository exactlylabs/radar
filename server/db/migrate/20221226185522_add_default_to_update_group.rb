class AddDefaultToUpdateGroup < ActiveRecord::Migration[6.1]
  def change
    add_column :update_groups, :default, :bool, default: false
  end
end
