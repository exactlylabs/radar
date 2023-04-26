require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '3s', overlap: false do
  begin
    if Rails.application.healthy? && !Rails.application.transient?
      Client.update_outdated_online!
    end
    Client.request_scheduled_tests!
    Rails.application.heartbeat!
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '1h', overlap: false do
  begin
    Client.refresh_outdated_data_usage!
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
