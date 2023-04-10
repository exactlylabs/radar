class AddDeletedAtToLocations < ActiveRecord::Migration[6.1]
  def change
    add_column :locations, :deleted_at, 'timestamp with time zone'
  end
end
