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
        authenticate_with_http_basic do |email, password|
          user = User.find_by(email: email.downcase)
          if user && user.valid_password?(password)
            sign_in(:user, user)
            @current_user = user
          else
            head :unauthorized
          end
        end
      end

      def current_user
        @current_user
      end

      def is_superuser
        if !@current_user.superuser?
          render json: {error: "you must be a superuser to use this endpoint"}, status: :forbidden
        end
      end
    end
  end
end