module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_account, :client
    rescue_from StandardError, with: :report_error

    def allow_request_origin?
      return true if request.headers["Sec-Radar-Tool"] == "true"
      super
    end

    def connect
      if request.user_agent.starts_with? "RadarPods"
        load_client
        on_client_connected
      elsif cookies['radar_current_account_id'].nil? # we need some features to work when we are logged out
        self.current_account = nil
      else
        self.current_account = identify_account
      end
    end

    def disconnect
      if self.client.present?
        on_client_disconnected
      end
    end

    private
    
    def identify_account
      # TODO: check this verification method when we implement multi-account views
      if(verified_account = Account.find_by(id: cookies['radar_current_account_id']))
        verified_account
      else
        reject_unauthorized_connection
      end
    end

    def report_error(error)
      Sentry.capture_exception(error)
    end

    def load_client
      # Load a Client from the Basic Authorization header
      token = request.authorization
      token_key, token_value = token.split(" ")
      if token_key != "Basic"
        head :unauthorized
      end
      unix_user, secret = token_value.split(":")
      self.client = Client.find_by_unix_user(unix_user)&.authenticate_secret(secret)
      if self.client.nil?
        reject_unauthorized_connection
      end
    end

    def on_client_connected
      if request.user_agent.starts_with? "RadarPodsAgent"
        if request.headers["Sec-Radar-Service-Started"] == "true"
          self.client.record_event(Client::Events::SERVICE_STARTED, {}, Time.now)
        end
        self.client.online = true
        self.client.ip = request.remote_ip
        self.client.pinged_at = Time.now
        self.client.save!
      end
    end

    def on_client_disconnected
      if request.user_agent.starts_with? "RadarPodsAgent"
        # if the connection is dropped, it's possible that this was already set to offline by our clock.rb process
        self.client.reload
        self.client.disconnected! if self.client.online
      end
    end
  end
end
