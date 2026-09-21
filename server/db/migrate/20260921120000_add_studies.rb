class AddStudies < ActiveRecord::Migration[6.1]
  def up
    create_table :studies do |t|
      t.string :name, null: false
      t.integer :completion_days, null: false
      t.boolean :notifications_enabled, null: false, default: false
      t.boolean :level_census_place, null: false, default: false
      t.boolean :level_census_tract, null: false, default: false
      t.boolean :level_zip, null: false, default: false
      t.boolean :level_isp_county, null: false, default: false
      t.timestamps
    end
    add_index :studies, :name, unique: true

    create_join_table :geospaces, :studies do |t|
      t.index [:study_id, :geospace_id], unique: true
      t.index :geospace_id
    end

    add_reference :study_aggregates, :study, index: true

    rural_id = execute(<<~SQL).first["id"]
      INSERT INTO studies (name, completion_days, notifications_enabled, level_census_place, level_isp_county, created_at, updated_at)
      VALUES ('rural', 90, true, true, true, NOW(), NOW())
      RETURNING id
    SQL

    execute <<~SQL
      INSERT INTO geospaces_studies (geospace_id, study_id)
      SELECT id, #{rural_id} FROM geospaces WHERE study_geospace = true
    SQL

    execute <<~SQL
      UPDATE study_aggregates SET study_id = #{rural_id}
      WHERE level IN ('state', 'state_with_study_only')
        AND geospace_id IN (SELECT geospace_id FROM geospaces_studies WHERE study_id = #{rural_id})
    SQL

    # Children of rural states (county, isp_county), then their children (census_place).
    2.times do
      execute <<~SQL
        UPDATE study_aggregates SET study_id = #{rural_id}
        WHERE study_id IS NULL
          AND parent_aggregate_id IN (SELECT id FROM study_aggregates WHERE study_id = #{rural_id})
      SQL
    end

    duplicates = execute(<<~SQL).to_a
      SELECT study_id, level, geospace_id, COALESCE(autonomous_system_org_id, 0) AS org_id, COUNT(*) AS rows
      FROM study_aggregates
      WHERE study_id IS NOT NULL
      GROUP BY 1, 2, 3, 4
      HAVING COUNT(*) > 1
    SQL
    raise "Duplicate study aggregates, merge them before migrating: #{duplicates.inspect}" if duplicates.any?

    add_index :study_aggregates, "study_id, level, geospace_id, COALESCE(autonomous_system_org_id, 0)",
      unique: true, name: "index_study_aggregates_on_identity"
  end

  def down
    remove_index :study_aggregates, name: "index_study_aggregates_on_identity"
    remove_reference :study_aggregates, :study
    drop_join_table :geospaces, :studies
    drop_table :studies
  end
end
