class CreateBuilds < ActiveRecord::Migration[6.1]
  def change
    create_table :builds do |t|
      t.string :build_str
      t.references :client_version, foreign_key: true
      t.index [:build_str, :client_version_id], unique: true
      t.timestamps
    end
    
    add_column :clients, :build_str, :string, null: true
  end
end
