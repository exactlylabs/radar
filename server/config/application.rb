require_relative "boot"

require "rails/all"
require "./lib/monitor/monitor.rb"
require "./lib/geotools/asns.rb"
require "./lib/events_notifier/notifier.rb"
require "./lib/tailscale/client.rb"
require "./lib/geotools/custom_geocoder.rb"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Radar
  class Application < Rails::Application
    include HealthMonitor

    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.

    # config.eager_load_paths << Rails.root.join("extras")

    config.assets.paths << Rails.root.join("vendor", "assets", "javascripts", "fonts")

    if ENV["CPU_PROFILER"].present?
      # call ./scripts/flamegraph.sh to generate flamegraphs from the dumps
      config.middleware.use StackProf::Middleware, enabled: true, interval: 1000, save_every: 1, mode: :cpu, raw: true
    end

    def inspect
      # Radar.application's default inspect is too large to the point it's using the whole console when printed.
      # Add here only the attributes that are useful for debugging.
      return "Radar::Application"
    end
  end
end
