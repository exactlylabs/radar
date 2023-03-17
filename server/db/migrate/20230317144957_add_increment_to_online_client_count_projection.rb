class AddIncrementToOnlineClientCountProjection < ActiveRecord::Migration[6.1]
  def change
    add_column :online_client_count_projections, :increment, :int
  end
end
