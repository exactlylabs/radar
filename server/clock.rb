require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '5s', overlap: false do
  begin
    if Rails.application.healthy? && !Rails.application.transient?
      Client.update_outdated_online!
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

scheduler.every '5m', overlap: false do
  begin
    FillStudyLevelProjection.perform_later
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '1m', overlap: false do
  begin
    Location.update_online_status!
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

begin
  scheduler.join
rescue Interrupt
  return
rescue SignalException
  return
end
