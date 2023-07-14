class CreateFeatureFlagsTable < ActiveRecord::Migration[6.1]
  def change
    create_table :feature_flags do |t|
      t.string :name, null: false
      t.boolean :generally_available, null: false, default: false
      t.timestamps
    end

    create_table :feature_flags_users do |t|
      t.references :feature_flag
      t.references :user
      t.timestamps
    end
  end
end
