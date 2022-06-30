module ClientApi
  module V1
    class ApiController < ActionController::Base
      before_action :rate_limit
      skip_forgery_protection

      protected

      def rate_limit
        client_ip = request.env["REMOTE_ADDR"]
        key = "count:#{client_ip}"
        count = REDIS.get(key)

        unless count
          REDIS.set(key, 0)
          REDIS.expire(key, 60) # 1 minute
          return true
        end

        if count.to_i >= 10 # 10 requests per minute
          render status: :too_many_requests, json: { message: "You have fired too many requests. Please wait some time before requesting this resource again." }
          return
        end

        REDIS.incr(key)
        true
      end
    end
  end
end