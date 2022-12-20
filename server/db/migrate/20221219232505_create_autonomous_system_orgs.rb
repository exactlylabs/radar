class CreateAutonomousSystemOrgs < ActiveRecord::Migration[6.1]
  def change
    create_table :autonomous_system_orgs do |t|
      t.string :name
      t.string :org_id, index: {unique: true}
      t.string :country
      t.string :source

      t.timestamps
    end

    create_table :autonomous_systems do |t|
      t.string :name
      t.string :asn, index: {unique: true}
      t.references :autonomous_system_org, foreign_key: true

      t.timestamps
    end

    add_column :clients, :ip, :string
    add_reference :clients, :autonomous_system, foreign_key: true

    add_column :measurements, :ip, :string
    add_reference :measurements, :autonomous_system, foreign_key: true
    
  end
end
