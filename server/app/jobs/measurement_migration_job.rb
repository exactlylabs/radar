class MeasurementMigrationJob < ApplicationJob
  queue_as :default

  def perform(location, old_account, account)
    # I'm guessing here we need to trigger the notify_change events
    location.measurements.where(account: old_account).update_all(account_id: account.id)
  end
end
