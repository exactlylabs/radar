class MeasurementMigrationJob < ApplicationJob
  queue_as :default

  def perform(location, old_account, account)
    location.measurements.where(account: old_account).update_all(account_id: account.id)
    location.recalculate_averages!
  end
end
