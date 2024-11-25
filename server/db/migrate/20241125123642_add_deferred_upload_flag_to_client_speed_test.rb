class AddDeferredUploadFlagToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_column :client_speed_tests, :deferred_upload, :boolean, default: false
  end
end
