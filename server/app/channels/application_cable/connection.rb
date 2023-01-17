module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_account
    rescue_from StandardError, with: :report_error

    def connect
      self.current_account = identify_account
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
  end
end
