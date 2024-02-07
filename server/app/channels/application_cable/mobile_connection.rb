module ApplicationCable
  class MobileConnection < ActionCable::Connection::Base
    # MobileConnection uses ActionCable backend, but it won't propagate messages to channels nor handle subscriptions as in a normal ActionCable connection.
    # This connection is intended for the mobile app to send data to the server only, and messages are expected to be of WsMobileMessagesPb::WSMessage type encoded in a byte array.
    # Any incoming message will be enqueued to the ProcessMobileScansJob, which will decode and process the message in the background.
    rescue_from StandardError, with: :report_error

    def initialize(server, env, coder: MobileCoder)
      # Override the default coder to MobileCoder
      super server, env, coder: coder
    end

    def allow_request_origin?
      # Uses the same method as in the client_api/v1/api_controller.rb
      !Rails.env.production? || request.origin && !widget_client.client_urls.include?(request.origin)
    end

     def report_error(error)
      Sentry.capture_exception(error)
    end

    def on_message(message)
      # Our messages come as byte arrays, and ActionCable complains of it not being a String.
      # This said, given our messages should come as byte arrays, we convert to a ASCII-8BIT encoded string.
      if message.is_a? Array
        message = message.pack('C*')
      end
      super message
    end

    def dispatch_websocket_message(message)
      # Called internally by the connection buffer to process the ws message (this is running in a different thread)
      # Enqueue the message back as a bytes array (if not, it can fail given it's not a valid UTF-8 encoding)
      message = message.bytes unless message.is_a? Array
      ProcessMobileScansJob.perform_later(message)
    end

    def widget_client
      @widget_client ||= WidgetClient.find_by_client_name('ExactlyLabs') # Default ExactlyLabs client
    end
  end
end
