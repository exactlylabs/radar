module ActionCable
  module Server
    class PodsServer < ActionCable::Server::Base
      # PodsServer overrides the default behavior of pinging every 3 seconds to every 15 seconds
      # only for when connecting through pods
      PODS_PING_INTERVAL = 15

      def setup_heartbeat_timer
        # See: https://github.com/rails/rails/blob/main/actioncable/lib/action_cable/server/connections.rb
        @heartbeat_timer ||= event_loop.timer(PODS_PING_INTERVAL) do
          event_loop.post { connections.each(&:beat) }
        end
      end
    end
  end

  module_function def pods_server
    # define a singleton, such as the ActionCable.server
    @pods_server ||= ActionCable::Server::PodsServer.new
  end
end
