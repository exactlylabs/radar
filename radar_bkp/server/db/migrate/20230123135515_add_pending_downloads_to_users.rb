class AddPendingDownloadsToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :pending_downloads, :string, array: true, nullable: true
  end
end
