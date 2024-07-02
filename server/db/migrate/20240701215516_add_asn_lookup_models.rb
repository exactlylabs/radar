class AddAsnLookupModels < ActiveRecord::Migration[6.1]
  def change
    create_table :asn_ip_lookups, id: nil do |t|
      t.references :autonomous_system, null: false, foreign_key: true
      t.inet :ip, null: false
      t.index :ip, using: :gist, opclass: :inet_ops
    end
  end
end
