require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

sh = StudyLevelHandler::Handler.new

scheduler.every '3s', overlap: false do
  if Rails.application.healthy? && !Rails.application.transient?
    Client.update_outdated_online!
  end
  Client.request_scheduled_tests!
  Rails.application.heartbeat!
end

scheduler.every '1m', overlap: false do
  ClientCountAggregate.aggregate!
  OnlineClientCountProjection.aggregate!
end

scheduler.every '5m', overlap: false do
  sh.aggregate!
end

scheduler.every '1h', overlap: false do
  Client.refresh_outdated_data_usage!
end

begin
  scheduler.join
rescue Interrupt
  return
rescue SignalException
  return
end
