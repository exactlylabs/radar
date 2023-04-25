require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

sh = StudyLevelHandler::Handler.new

scheduler.every '5m', overlap: false do
  begin
    ClientCountAggregate.aggregate!
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '5m', overlap: false do
  begin
    OnlineClientCountProjection.aggregate!
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '5m', overlap: false do
  begin
    sh.aggregate!
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

def scheduler.on_error(job, error)
  Rails.logger.error(
    "err#{error.object_id} rufus-scheduler intercepted #{error.inspect}" +
    " in job #{job.inspect}"
  )
  error.backtrace.each_with_index do |line, i|
    Rails.logger.error(
      "err#{error.object_id} #{i}: #{line}"
    )
  end
end

begin
  scheduler.join
rescue Interrupt
  return
rescue SignalException
  return
end
