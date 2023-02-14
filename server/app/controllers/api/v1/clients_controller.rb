module Api
    module V1
      class ClientsController < ApiController
        before_action :authenticate_client!

        private

        def authenticate_client!
          client_id = params[:unix_user]
          client_secret = params[:secret]
          @client = Client.find_by_unix_user(client_id)&.authenticate_secret(client_secret)
          if !@client
            head(403)
          end
        end

      end
    end
end