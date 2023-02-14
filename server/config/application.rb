require_relative "boot"

require "rails/all"
require "./lib/monitor/monitor.rb"
require "./lib/geotools/asns.rb"
require "./lib/events_notifier/notifier.rb"
require './app/channels/application_cable/pods_server.rb'


# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Radar
  class Application < Rails::Application
    include HealthMonitor

    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1

    # Default to not log to Stackdriver / Google Cloud Logging
    config.google_cloud.use_trace = false
    config.google_cloud.use_logging = false
    config.google_cloud.use_error_reporting = false

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    config.assets.paths << Rails.root.join("vendor", "assets", "javascripts")

    if ENV["CPU_PROFILER"].present?
      # call ./scripts/flamegraph.sh to generate flamegraphs from the dumps
      config.middleware.use StackProf::Middleware, enabled: true, interval: 1000, save_every: 1, mode: :cpu, raw: true
    end
  end
end
