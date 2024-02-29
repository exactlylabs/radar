class DropStudyLevelProjectionTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :study_level_projections
  end
end
