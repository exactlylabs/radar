require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

sh = StudyLevelHandler::Handler.new

scheduler.every '5m', overlap: false do
  ClientCountAggregate.aggregate!
end

scheduler.every '5m', overlap: false do
    OnlineClientCountProjection.aggregate!
end

scheduler.every '5m', overlap: false do
  sh.aggregate!
end

begin
  scheduler.join
rescue Interrupt
  return
rescue SignalException
  return
end
