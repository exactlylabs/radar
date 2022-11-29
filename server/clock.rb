require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '3s' do
  Client.update_outdated_online!
  Client.refresh_outdated_data_usage!
end

scheduler.join
