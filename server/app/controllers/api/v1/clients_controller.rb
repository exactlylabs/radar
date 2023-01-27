module Api
    module V1
      class ClientsController < ApiController
        before_action :authenticate_client!
        skip_before_action :check_basic_auth, only: [:get_token]

        def get_token
          # Authenticates a pod based on its unix_user and secret
          # It returns a JWT token, with a short span
          begin
            exp = Rails.env.development? ? nil : 5.minutes.from_now
            token = JsonWebToken.encode({client_id: @client.id}, exp)
          rescue JWT::EncodeError => e
            return render json: {errors: e.message}, status: :unauthorized
          end
          render json: {token: token}
        end


        private

        def authenticate_client!
          client_id = params[:unix_user]
          client_secret = params[:secret]
          puts client_id
          @client = Client.find_by_unix_user(client_id)&.authenticate_secret(client_secret)
          if !@client
            head(403)
          end
        end

      end
    end
end