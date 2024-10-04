Sentry.init do |config|
  config.dsn = 'https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151'
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  config.traces_sample_rate = 0.0

  config.enabled_environments = %w[production staging]

  config.excluded_exceptions += [
    'AWS::S3::Errors::Http408Error', 'AWS::S3::Errors::InternalError', 'AWS::S3::Errors::SlowDown', 'Seahorse::Client::NetworkingError' # No need to alert about Backblaze API failing.
  ]
end
