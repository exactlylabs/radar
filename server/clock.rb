require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '3s' do
  Client.update_outdated_online!
end

scheduler.join
