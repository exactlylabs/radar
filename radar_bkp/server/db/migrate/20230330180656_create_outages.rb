class CreateOutages < ActiveRecord::Migration[6.1]
  def change
    create_table :system_outages do |t|
      t.string :description
      t.column :start_time, "timestamp with time zone"
      t.column :end_time, "timestamp with time zone"

      t.timestamps
    end
    add_column :consumer_offsets, :state, :jsonb, default: {}
  end
end
