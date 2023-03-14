module ClientApi
  module V1
    class ApiController < ActionController::Base
      before_action :rate_limit
      skip_forgery_protection
      before_action :set_client
      before_action :check_allowed_origin
      after_action :set_cors_headers

      def check_allowed_origin
        head(403) if request.origin && !@widget_client.client_urls.include?(request.origin) # If request has no origin, skip (could be a non-browser client)
        if request.request_method == "OPTIONS"
          set_cors_headers
          head(200)
        end
      end

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

        if count.to_i >= 1000 # 10 requests per minute
          render status: :too_many_requests, json: { message: "You have fired too many requests. Please wait some time before requesting this resource again." }
          return
        end

        REDIS.incr(key)
        true
      end

      def set_client
        if params[:client_id]
          @widget_client = WidgetClient.find(params[:client_id])
        else
          @widget_client = WidgetClient.find_by_client_name('ExactlyLabs') # Default ExactlyLabs client
        end
        unless @widget_client
          raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:client_id]}", WidgetClient.name, params[:client_id])
        end
      end

      def set_cors_headers
        # By this point we already validated that the origin is allowed
        response.set_header('Access-Control-Allow-Origin', request.origin)
        response.set_header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT')
        response.set_header('Access-Control-Allow-Headers', 'Origin, Content-Type')
      end
    end
  end
end