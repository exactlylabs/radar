class DropStudyLevelProjectionTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :study_level_projections, force: :cascade
  end
end
