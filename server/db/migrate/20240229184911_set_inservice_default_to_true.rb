class SetInserviceDefaultToTrue < ActiveRecord::Migration[6.1]
  def change
    change_column_default :clients, :in_service, true
  end
end
