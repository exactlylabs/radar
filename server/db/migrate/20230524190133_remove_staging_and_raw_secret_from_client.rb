class RemoveStagingAndRawSecretFromClient < ActiveRecord::Migration[6.1]
  def change
    remove_column :clients, :raw_secret
    remove_column :clients, :staging
  end
end
