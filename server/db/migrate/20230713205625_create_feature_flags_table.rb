class CreateFeatureFlagsTable < ActiveRecord::Migration[6.1]
  def change
    create_table :feature_flags do |t|
      t.string :name, null: false
      t.boolean :generally_available, null: false, default: false
      t.timestamps
    end

    create_join_table :feature_flags, :users, table_name: :feature_flags_users
  end
end
