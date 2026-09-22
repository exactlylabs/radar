class DropStudyGeospaceAndCompleted < ActiveRecord::Migration[6.1]
  def up
    remove_column :geospaces, :study_geospace
    remove_column :location_metadata_projections, :completed
  end

  def down
    add_column :geospaces, :study_geospace, :boolean, default: false
    add_column :location_metadata_projections, :completed, :boolean, default: false
    execute <<~SQL
      UPDATE geospaces SET study_geospace = true
      WHERE id IN (SELECT geospace_id FROM geospaces_studies)
    SQL
    execute <<~SQL
      UPDATE location_metadata_projections SET completed = days_online >= 90
    SQL
  end
end
