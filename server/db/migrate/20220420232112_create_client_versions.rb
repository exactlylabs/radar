class CreateClientVersions < ActiveRecord::Migration[6.1]
  def change
    # ClientVersion model
    create_table :client_versions do |t|
      t.string :version, index: { unique: true }

      t.timestamps
    end

    add_reference :clients, :client_version, foreign_key: true
    add_column :clients, :raw_version, :string, null: true, default: nil

    # UpdateGroup model
    create_table :update_groups do |t|
      t.string :name
      t.references :client_version, foreign_key: true

      t.timestamps
    end

    add_reference :clients, :update_group, foreign_key: true

    
  end
end
