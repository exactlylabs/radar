require 'rufus-scheduler'

scheduler = Rufus::Scheduler.new

scheduler.every '3s', overlap: false do
  begin
    Rails.application.heartbeat!
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '5s', overlap: false do
  begin
    if Rails.application.healthy? && !Rails.application.transient?
      Client.update_outdated_online!
      Location.update_online_status!
      Client.resend_missed_test_requests!
      Rails.application.send_cronjob_heartbeat(BETTERSTACK_KEYS[:online_status_update_cron])
    end
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '15s', overlap: false do
  begin
    # Location.request_scheduled_tests! # TODO: Uncomment after UI has migrated scheduling at Network-level
    Client.request_scheduled_tests! # TODO: Remove after UI has migrated scheduling at Network-level
    Rails.application.send_cronjob_heartbeat(BETTERSTACK_KEYS[:request_tests_cron])
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

scheduler.every '5m', overlap: false do
  begin
    ProcessOutages.perform_later
    FillClientCountProjection.perform_later
    DeliverPartialPublicPageSubmissionsJob.perform_later
    ProcessNetworkStatusHistoryProjectorJob.perform_later
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end


scheduler.every '1h', overlap: false do
  begin
    Location.refresh_outdated_data_usage!
    Client.refresh_outdated_data_usage!
    MetricsProjectionJob.perform_later
    RefreshMaterializedViewsJob.perform_later
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
