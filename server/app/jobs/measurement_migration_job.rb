class MeasurementMigrationJob < ApplicationJob
  queue_as :default

  def perform(location, account)
    # I'm guessing here we need to trigger the notify_change events
    location.measurements.update_all(account_id: account.id)
  end
end