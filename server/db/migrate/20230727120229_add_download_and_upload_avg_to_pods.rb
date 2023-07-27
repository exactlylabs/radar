class AddDownloadAndUploadAvgToPods < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :download_avg, :float
    add_column :clients, :upload_avg, :float
  end
end
