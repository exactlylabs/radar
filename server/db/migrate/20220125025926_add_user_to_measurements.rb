class AddUserToMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_reference :measurements, :user, foreign_key: true
  end
end
