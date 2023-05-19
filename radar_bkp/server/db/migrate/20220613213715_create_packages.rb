class CreatePackages < ActiveRecord::Migration[6.1]
  def change
    create_table :packages do |t|
      t.string :name
      t.string :os
      t.references :client_version, foreign_key: true

      t.timestamps
    end
  end
end
