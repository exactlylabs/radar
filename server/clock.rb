require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '3s' do
  if Rails.application.healthy? && !Rails.application.transient?
    Client.update_outdated_online!
  end
  Client.request_scheduled_tests!
  Rails.application.heartbeat!
end

scheduler.every '1m' do
  threads = []
  threads << Thread.new do
    ClientCountAggregate.aggregate!
  end
  threads << Thread.new do 
    OnlineClientCountProjection.aggregate!
  end
  threads.map(&:join)
end

scheduler.every '1h' do
  Client.refresh_outdated_data_usage!
end

begin
  scheduler.join
rescue Interrupt
  return
rescue SignalException
  return
end
