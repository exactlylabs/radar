require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '5s', overlap: false do
  begin
    if Rails.application.healthy? && !Rails.application.transient?
      Client.update_outdated_online!
      Location.update_online_status!
    end
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '3s', overlap: false do
  Rails.application.heartbeat!
end

scheduler.every '15s', overlap: false do
  Client.request_scheduled_tests!
end

scheduler.every '1h', overlap: false do
  begin
    Client.refresh_outdated_data_usage!
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW aggregated_measurements_by_hours")
    ActiveRecord::Base.connection.execute("REFRESH MATERIALIZED VIEW aggregated_measurements_by_days")
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '5m', overlap: false do
  begin
    FillClientCountProjection.perform_later
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '1h', overlap: false do
  begin
    FillStudyLevelProjection.perform_later
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '1h', overlap: false do
  begin
    MetricsProjectionJob.perform_later
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end


begin
  scheduler.join
rescue Interrupt

rescue SignalException

end
