class CreateClients < ActiveRecord::Migration[6.1]
  def change
    create_table :clients do |t|
      t.string :unix_user, null: false, index: { unique: true }
      t.string :secret_digest

      t.string :public_key
      t.string :endpoint_host
      t.integer :endpoint_port
      t.integer :remote_gateway_port

      t.string :name
      t.string :address
      t.float :latitude
      t.float :longitude

      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
