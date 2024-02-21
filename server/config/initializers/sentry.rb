Sentry.init do |config|
  config.dsn = 'https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151'
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  config.traces_sample_rate = 0.0

  config.before_send = lambda do |event, hint|
    e = hint[:exception]
    begin
      if REDIS.get("sentry:#{e.class.name}:#{e.message}").nil?
        REDIS.set("sentry:#{e.class.name}:#{e.message}", 1)
        REDIS.expire("sentry:#{e.class.name}:#{e.message}", 300) # 5 minutes
        event
      else
        nil
      end
    rescue
      event
    end
  end


  config.enabled_environments = %w[production]
end
