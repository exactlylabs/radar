module MobileApi::V1
  class ApiController < ActionController::Base
    before_action :authenticate!
  
    def render_error_for(model)
      render json: {
        errors: model.errors,
        error_code: "validation_error"
      }, status: 422
    end

    def authenticate!
      if request.authorization.nil?
        head(401)
        return
      end

      token_type, token = request.authorization.split(" ")
      if token_type != "Token"
        head(401)
        return
      end

      @current_user_device = MobileUserDevice.find_by_token(token)
      if @current_user_device.nil?
        head(401)
        return
      end
      @current_user = @current_user_device.user
    end
  end
end
