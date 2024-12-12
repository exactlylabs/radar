class AddAssignableForSchedulingToClient < ActiveRecord::Migration[6.1]
  def change
    remove_reference :locations, :scheduling_selected_client, foreign_key: { to_table: :clients }
    add_column :clients, :assignable_for_scheduling, :boolean, default: true
  end
end
