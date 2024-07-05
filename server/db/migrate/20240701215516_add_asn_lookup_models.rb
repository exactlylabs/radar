class AddAsnLookupModels < ActiveRecord::Migration[6.1]
  def change
    add_column :autonomous_systems, :opaque_id, :string
    add_column :autonomous_systems, :source, :string
    add_column :autonomous_systems, :source_file_timestamp, :timestamp
    add_column :autonomous_system_orgs, :source_file_timestamp, :timestamp
    create_table :asn_ip_lookups, id: nil do |t|
      t.references :autonomous_system, null: false, foreign_key: true
      t.inet :ip, null: false
      t.timestamp :source_file_timestamp
      t.index :ip, using: :gist, opclass: :inet_ops
    end
  end
end
