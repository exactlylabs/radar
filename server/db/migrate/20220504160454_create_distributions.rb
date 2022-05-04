class CreateDistributions < ActiveRecord::Migration[6.1]
  def change
    create_table :distributions do |t|
      t.string :name
      t.references :client_version, foreign_key: true
      t.index [:name, :client_version_id], unique: true
      t.timestamps
    end
    
    add_column :clients, :distribution_name, :string, null: true
  end
end
