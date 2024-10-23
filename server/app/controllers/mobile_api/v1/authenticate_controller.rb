module MobileApi::V1
  class AuthenticateController < ApiController
    skip_before_action :authenticate!, only: [:new_code, :get_token, :resend_code]

    def new_code
      existing_code = EmailVerificationCode.pending_for_device(new_code_params[:email], new_code_params[:device_id])
      if existing_code.present?
        existing_code.expire!
      end

      code = EmailVerificationCode.create(new_code_params.merge(reason: :new_token))
      if code.errors.present?
        return render_error_for(code)
      end

      MobileMailer.with(verification_code: code).verification_code_email.deliver_later
      head(202)
    end

    def get_token
      code = EmailVerificationCode.find_by(code: get_token_params[:code], device_id: get_token_params[:device_id])
      if code.nil?
        head(401)
        return
      end
      if code.expired?
        render json: { 
          "error" => "Validation code has expired.", "error_code" => "expired" 
        }, status: 401
        return
      end

      User.transaction do
        code.expire!
        user = User.find_by_email(code.email)
        if user.nil?
          user = User.create!(email: code.email, pods_access: false)
        end
        device_session = user.mobile_user_devices.find_by_device_id(code.device_id)
        if device_session.nil?
          device_session = MobileUserDevice.create(user: user, device_id: code.device_id)
          if device_session.errors.present?
            return render_error_for(device_session)
          end
        end
        render json: {
          token: device_session.token
        }, status: 200
      end
    end

    private

    def new_code_params
      params.permit(:email, :device_id)
    end

    def get_token_params
      params.permit(:device_id, :code)
    end
  end
end