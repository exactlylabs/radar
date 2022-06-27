class AddExportUserFlagToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :exportuser, :boolean, default: false
  end
end
