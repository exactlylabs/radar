class AddUniqueIndexToGeospaces < ActiveRecord::Migration[6.1]
  def change
    reversible do |direction|
      direction.up do
        change_column :geospaces, :created_at, :datetime, null: false, default: -> { "CURRENT_TIMESTAMP" }
        change_column :geospaces, :updated_at, :datetime, null: false, default: -> { "CURRENT_TIMESTAMP" }
      end
      direction.down do
      end
    end
      add_index :geospaces, [:namespace, :geoid], unique: true
      add_column :geospaces, :hrsa_designated_rural_area, :boolean, default: false
      add_column :geospaces, :expanded_study_area, :boolean, default: false
  end
end
