class CreateCountProjections < ActiveRecord::Migration[6.1]
  def change
    create_table :online_client_count_projections do |t|
      # Dimensions
      t.references :account, foreign_key: true
      t.references :autonomous_system, foreign_key: true
      t.references :location, foreign_key: true

      # Attributes
      t.integer :online, default: 0
      t.integer :total, default: 0
      t.integer :total_in_service, default: 0
      t.column :timestamp, "timestamp with time zone"

      t.references :event, foreign_key: true
    end
  end
end
