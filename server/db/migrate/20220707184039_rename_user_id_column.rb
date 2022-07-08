class RenameUserIdColumn < ActiveRecord::Migration[6.1]
  def change
    rename_column :locations, :user_id, :created_by_id
    rename_column :clients, :user_id, :claimed_by_id
  end
end
