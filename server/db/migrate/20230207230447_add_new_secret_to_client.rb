class AddNewSecretToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :new_secret_digest, :string
  end
end
