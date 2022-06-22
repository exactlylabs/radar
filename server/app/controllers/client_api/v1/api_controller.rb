module ClientApi
  module V1
    class ApiController < ActionController::Base
      
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

      def cors_preflight_check
        head(:no_content) if request.request_method == "OPTIONS"
      end

      def set_cors_access_control_headers
        response.headers["Access-Control-Allow-Origin"] = Rails.env.development? ? 'http://localhost:9999' : '*' # TODO change to deployed URL
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
      end

    end
  end
end