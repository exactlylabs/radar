Sentry.init do |config|
  config.dsn = 'https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151'
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # Set tracesSampleRate to 1.0 to capture 100%
  # of transactions for performance monitoring.
  # We recommend adjusting this value in production
  config.traces_sample_rate = 1.0
  # or
  config.traces_sampler = lambda do |context|
    true
  end

  config.enabled_environments = %w[production]
end
