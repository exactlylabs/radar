class RefreshMaterializedViewsJob < ApplicationJob
  queue_as :default

  def perform()
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW aggregated_measurements_by_hours")
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW aggregated_measurements_by_days")
  end
end
