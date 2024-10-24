module MobileApi::V1
  class ApiController < ActionController::API
    before_action :authenticate!

    DEFAULT_LIMIT = 100

    def render_error_for(model)
      render json: {
        errors: model.errors,
        error_code: "validation_error"
      }, status: 422
    end

    def render_unauthorized_error
      render json: {
        error: "Unauthorized Request",
        error_code: "unauthorized"
      }, status: 401
    end

    def render_paginated_response(items, &block)
      count = items.count
      offset = params[:offset] || 0
      limit = params[:limit] || DEFAULT_LIMIT
      items = items
        .offset(offset)
        .limit(limit)
        .map { |item| block.present? ? block.call(item) : item.to_json }
      render json: {
        count: count,
        items: items
      }, status: 200
    end

    def render_not_found()
      render json: {
        "error": "Record not Found",
        "error_code": "not_found"
      }, status: 404
    end

    def authenticate!
      if request.authorization.nil?
        return render_unauthorized_error
      end

      token_type, token = request.authorization.split(" ")
      if token_type != "Token"
        return render_unauthorized_error
      end

      @current_user_device = MobileUserDevice.find_by_token(token)
      if @current_user_device.nil?
        return render_unauthorized_error
      end
      @current_user = @current_user_device.user
    end
  end
end
