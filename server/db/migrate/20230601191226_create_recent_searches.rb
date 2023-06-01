class CreateRecentSearches < ActiveRecord::Migration[6.1]
  def change
    create_table :recent_searches do |t|
      t.references :user, null: false, foreign_key: true
      t.references :location, null: true, foreign_key: true
      t.references :client, null: true, foreign_key: true
      t.timestamps
    end
  end
end
