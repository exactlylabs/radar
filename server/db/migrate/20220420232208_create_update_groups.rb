class CreateUpdateGroups < ActiveRecord::Migration[6.1]
  def change
    create_table :update_groups do |t|
      t.string :name
      t.references :client_version, foreign_key: true

      t.timestamps
    end

    add_reference :clients, :update_group, foreign_key: true
  end
end
