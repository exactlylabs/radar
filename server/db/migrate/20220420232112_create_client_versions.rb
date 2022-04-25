class CreateClientVersions < ActiveRecord::Migration[6.1]
  def change
    create_table :client_versions do |t|
      t.string :version, index: { unique: true }

      t.timestamps
    end

    add_reference :clients, :client_version, foreign_key: true
  end
end
