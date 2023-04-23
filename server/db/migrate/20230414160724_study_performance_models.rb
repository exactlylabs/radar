class StudyPerformanceModels < ActiveRecord::Migration[6.1]
  def change
    create_table :study_aggregates do |t|
      t.string :name
      t.references :parent_aggregate
      t.references :geospace, foreign_key: true
      t.references :autonomous_system_org, foreign_key: true
      t.string :level
      t.boolean :study_aggregate, default: false
      t.timestamps
    end
    add_foreign_key :study_aggregates, :study_aggregates, column: :parent_aggregate_id, primary_key: :id

    create_table :study_level_projections do |t|
      t.column :timestamp, 'timestamp with time zone'
      t.references :parent_aggregate
      t.references :study_aggregate, foreign_key: true
      t.references :autonomous_system_org, foreign_key: true
      t.references :location, foreign_key: true
      t.references :event, foreign_key: true
      t.references :measurement, foreign_key: true
      t.references :client_speed_test, foreign_key: true
      t.column :lonlat, :st_point, geographic: true
      t.string :level
      
      # Online Pods Metric: Number of pods online
      t.integer :online_count, default: 0
      t.integer :incr, default: 0
      
      # Online Locations Metric:
      t.boolean :location_online, default: false
      t.integer :location_online_incr, default: 0
      
      # Tests Metric: Number of measurements taken
      t.integer :measurement_count, default: 0
      t.integer :measurement_incr, default: 0
      
      # Locations Metric: Number of unique locations (lonlat) with at least one speed test (from widget or pods)
      t.integer :points_with_tests_count, default: 0
      t.integer :points_with_tests_incr, default: 0

      # Completed Locations Metric: Number of locations with at least one pod that summed 90 days online
      t.integer :days_online_count, default: 0
      t.integer :completed_locations_count, default: 0
      t.integer :completed_locations_incr, default: 0
      t.boolean :location_completed, default: false
      
    end
    add_foreign_key :study_level_projections, :study_aggregates, column: :parent_aggregate_id, primary_key: :id
    create_join_table :geospaces, :autonomous_system_orgs, name: "geospaces_as_orgs" do |t|
      t.index :geospace_id, name: "idx_geospaces_as_orgs_geospace_id"
      t.index :autonomous_system_org_id, name: "idx_geospaces_as_orgs_as_org_id"
    end

    add_column :measurements, :lonlat, :st_point, geographic: true
    add_column :client_speed_tests, :lonlat, :st_point, geographic: true
    add_index :measurements, :lonlat
    add_index :client_speed_tests, :lonlat

    add_column :client_speed_tests, :autonomous_system_id, :bigint
    add_foreign_key :client_speed_tests, :autonomous_systems
  end
end
