class CreateMeasurements < ActiveRecord::Migration[6.1]
  def change
    create_table :measurements do |t|
      t.string :style
      t.references :client, null: false, foreign_key: true

      t.float :upload
      t.float :download
      t.float :jitter
      t.float :latency

      t.boolean :processed
      t.datetime :processed_at

      t.timestamps
    end
  end
end
