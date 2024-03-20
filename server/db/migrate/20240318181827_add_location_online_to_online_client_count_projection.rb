class AddLocationOnlineToOnlineClientCountProjection < ActiveRecord::Migration[6.1]
  def change
    add_column :online_client_count_projections, :is_online, :boolean
    add_column :online_client_count_projections, :location_online_incr, :integer

  end
end
