class LocationMetadata < ActiveRecord::Migration[6.1]
  def change
    create_table :notified_study_goals do |t|
      t.references :geospace
      t.references :autonomous_system_org, optional: true
      t.integer :goal

      t.timestamps
    end
    add_column :geospaces, :study_geospace, :boolean, default: false
    add_column :locations, :offline_since, "timestamp with time zone"
    add_column :locations, :online, :boolean, default: false
  end
end
