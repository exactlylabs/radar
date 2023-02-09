class AddLossRateToMeasurements < ActiveRecord::Migration[6.1]
  def change
    add_column :measurements, :loss_rate, :float
  end
end
