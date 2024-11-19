class RefreshMaterializedViewsJob < ApplicationJob
  queue_as :default

  def perform()
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY aggregated_measurements_by_hours")
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY aggregated_measurements_by_days")
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY aggregated_pod_measurements_by_hours")
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY aggregated_pod_measurements_by_days")
  end
end
