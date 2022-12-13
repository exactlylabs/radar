require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '3s' do
  Client.update_outdated_online!
end

scheduler.every '1h' do
  Client.refresh_outdated_data_usage!
end

scheduler.join
