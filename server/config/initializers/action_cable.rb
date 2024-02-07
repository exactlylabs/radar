CHANNELS = {
  clients_status: 'clients_status',
  exports: 'exports',
  notifications: 'notifications',
  watchdog_pub: 'watchdog_pub',
}

module ActionCable
  # Declare a new ActionCable server for the mobile app to send data to.
  module_function def mobile_server
    @mobile_server ||= ActionCable::Server::Base.new
    @mobile_server.config.connection_class = -> { ApplicationCable::MobileConnection }
    @mobile_server
  end
end
