class AddInUseFlagToClient < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :in_service, :boolean, default: false
  end
end
