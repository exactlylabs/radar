class AddRawSecretToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :raw_secret, :string, null: true
  end
end
