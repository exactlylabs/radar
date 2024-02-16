CHANNELS = {
  clients_status: 'clients_status',
  exports: 'exports',
  notifications: 'notifications',
  watchdog_pub: 'watchdog_pub',
}

module ActionCable
  # Declare a new ActionCable server for the mobile app to send data to.
  # This server works separate from the main one, so it will have its own worker pools
  module_function def mobile_server
    # We have to instantiate a new config, otherwise we'll share the same instance with the default server
    # This new config points to the MobileConnection class, and we also have to set the logger,
    #  otherwise it would be nil as it's set somewhere in Rails initialization phase.
    config = ActionCable::Server::Configuration.new
    config.connection_class = -> { ApplicationCable::MobileConnection }
    config.logger = ActionCable.server.config.logger
    @mobile_server ||= ActionCable::Server::Base.new(config: config)
  end
end
