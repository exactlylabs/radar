Sidekiq.configure_server do |config|
  config.logger.level = Rails.env.production? ? Logger::WARN : Rails.env.staging? ? Logger::WARN : Logger::INFO
end