require 'net/http'

module HealthMonitor
    # HealthMonitor ensures our system is in a healthy state by
    # * Pinging the service URL, asserting is reachable by external callers
    # * Controlling a heartbeat, moving the system into an unhealthy state if missed
    #
    # If the system goes to an unhealthy state by any of the conditions above, we enter a transient state.
    # Whenever the system goes back to a healthy state, the transient state duration starts to count until the system is back to a normal state.

    HEARTBEAT_TOLERANCE = 15.seconds
    TRANSIENT_DURATION = 60.seconds

    def healthy?
        reachable? && !missed_heartbeat?
    end

    def transient?
        # Transient mode is when the system is already responding heartbeats, but is set in a state where it's still considered offline
        # to give time to all other tasks to go back to normal
        REDIS.get(redis_key + "_transient") == "true"
    end

    def heartbeat!
        if !healthy?
            # Before a heartbeat, if our system is set as not healthy
            # we first enter into a transient state.
            REDIS.set(redis_key + "_transient", true, ex: TRANSIENT_DURATION)
        end
        REDIS.set(redis_key, Time.now)
    end

    private 

    def url
        ENV["HEALTHCHECK_URL"] || "https://radar.exactlylabs.com/health"
    end

    def redis_key
        self.class.name.downcase + "_healthmonitor"
    end

    def last_heartbeat
        hb = REDIS.get(redis_key)
        hb.to_datetime if hb
    end

    def missed_heartbeat?
        hb = last_heartbeat
        hb.nil? || Time.now - hb > HEARTBEAT_TOLERANCE
    end

    def reachable?
        if Rails.env.development?
            return true
        end
        begin
            uri = URI(url)
            http = Net::HTTP.new uri.host, uri.port
            http.use_ssl = true if uri.scheme == "https"
            http.read_timeout = 2
            resp = http.get uri.path
            return resp.code == "200" && JSON::parse!(resp.body)["postgres"]["connected"]

        rescue
          return false
        end
    end

end