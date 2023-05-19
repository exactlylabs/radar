module Rack
  class  HealthCheck
    def call(env)
      status = {
        #redis: {
        #  connected: redis_connected
        #},
        postgres: {
          connected: postgres_connected
        }
      }

      return [200, {}, [status.to_json]]
    end

    protected

    def redis_connected
      $redis.ping == 'PONG' rescue false
    end

    def postgres_connected
      begin
        ApplicationRecord.connection
        ApplicationRecord.connected?
      rescue
        false
      end
    end
  end
end
