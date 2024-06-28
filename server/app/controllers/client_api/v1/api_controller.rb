module ClientApi
  module V1
    class ApiController < ActionController::Base
      skip_forgery_protection
      before_action :set_client
      before_action :check_allowed_origin
      after_action :set_cors_headers

      def check_preflight
        if request.request_method == "OPTIONS"
          set_client
          set_cors_headers
        end
      end

      def check_allowed_origin
        @allowed = true
        if Rails.env.production? && request.origin && !@widget_client.client_urls.include?(request.origin) # Just check for origin if present, else, skip
          @allowed = false
        end
      end

      protected

      def rate_limit
        client_ip = request.remote_ip
        key = "count:#{client_ip}"

        count = REDIS.incr(key)
        if count == 1
          REDIS.expire(key, 60) # 1 minute
        end

        if count.to_i > 10 # 10 requests per minute
          render status: :too_many_requests, json: { message: "You have fired too many requests. Please wait some time before requesting this resource again." }
          return
        end
        true
      end

      def set_client
        @widget_client = WidgetClient.where(id: params[:client_id]).first
        @widget_client ||= WidgetClient.find_by_client_name('ExactlyLabs') # Default ExactlyLabs client
      end

      def set_cors_headers
        if request.origin
          if @allowed
            response.set_header('Access-Control-Allow-Origin', request.origin)
          else
            response.set_header('Access-Control-Allow-Origin', @widget_client.client_urls[0]) # Defaulting to the first allowed url, would force CORS error on browser
          end
        end
        response.set_header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT')
        response.set_header('Access-Control-Allow-Headers', 'Origin, Content-Type')
      end
    end
  end
end
