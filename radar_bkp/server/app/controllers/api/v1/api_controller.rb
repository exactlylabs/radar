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

      private
      def check_basic_auth
        unless request.authorization.present?
          head :unauthorized
          return
        end
        token = request.authorization
        token_key, token_value = token.split(" ")
        if token_key != "Token"
          head :unauthorized
        end
        @account = Account.find_by_token(token_value)
        head :unauthorized unless @account
      end

      def ensure_superaccount!
        if !@account.superaccount?
          render json: {error: "you must be a superaccount to use this endpoint"}, status: :forbidden
        end
      end
    end
  end
end