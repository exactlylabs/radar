module Api
  module V1
    class ApiController < ActionController::Base
      include Pundit

      before_action :configure_permitted_parameters, if: :devise_controller?
      before_action :check_basic_auth
      skip_before_action :verify_authenticity_token

      def render_error_for(model)
        render json: {
          errors: model.errors,
        }, status: 400
      end

      def pundit_user
        AuthenticationHolder.new(@current_user, false, false, false)
      end

      private

      ##
      #
      # Authenticates either an Account or UsersAccount in a Token type Auth.
      #
      ##
      def check_basic_auth
        token_value = get_token("Token")
        unless token_value.present?
          head :unauthorized
          return
        end

        @account = Account.find_by_token(token_value)
        if @account.nil?
          user_account = UsersAccount.find_by_token(token_value)
          if user_account.present?
            @account = user_account.account
            @current_user = user_account.user
          end
        end

        head :unauthorized unless @account.present?
      end

      def authenticate_client
        token_value = get_token("ClientToken")
        unless token_value.present?
          head :unauthorized
          return
        end

        # unix_user:secret base64 encoded
        unix_user, secret = Base64.decode64(token_value)&.split(":")
        @client = Client.find_by_unix_user(unix_user)&.authenticate_secret(secret)

        head :unauthorized unless @client.present?
      end

      def ensure_superaccount!
        if !@account.superaccount?
          render json: {error: "you must be a superaccount to use this endpoint"}, status: :forbidden
        end
      end

      def get_token(expected_type)
        return unless request.authorization.present?

        token = request.authorization
        token_key, token_value = token.split(" ")
        return unless token_key == expected_type

        token_value
      end
    end
  end
end
