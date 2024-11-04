module MobileApi::V1
 class UserController < ApiController

  # POST /mobile_api/v1/user/email
  def change_email
    existing_code = EmailVerificationCode.pending_change_email_for_user(@current_user_device)
    if existing_code.present?
      existing_code.expire!
    end

    code = EmailVerificationCode.create(
      email: change_email_params[:email],
      mobile_user_device: @current_user_device,
      reason: :change_email,
    )
    if code.errors.present?
      return render_error_for(code)
    end

    MobileMailer.with(verification_code: code).verification_code_email.deliver_later
    head(202)
  end

  # POST /mobile_api/v1/user/email/validate
  def validate_code
    code = EmailVerificationCode.pending_change_email_for_user(@current_user_device)
    if code.nil? || code.code != validate_code_params[:code]
      render json: {
        error: "Change email request not found.", "error_code": "not_found"
      }, status: 404
      return
    end

    User.transaction do
      @current_user.update(email: code.email)
      code.expire!
    end

    if @current_user.errors.present?
     return render_error_for(@current_user)
    end

    render json: {
      email: @current_user.email
    }, status: 200
  end

  # GET /mobile_api/v1/user/settings
  def get_settings
    render_account_settings(@current_user.mobile_account_settings)
  end

  # PATCH /mobile_api/v1/user/settings
  def patch_settings
    account_settings = @current_user.mobile_account_settings

    _params = patch_settings_params.to_h

    if _params[:home_latitude].present? && _params[:home_longitude].present?
        point = "POINT(#{_params[:home_longitude]} #{_params[:home_latitude]})"
        _params = _params.merge({home_lonlat: point})
    end

    account_settings.update(_params.except(:home_latitude, :home_longitude))
    if account_settings.errors.present?
      return render_error_for(account_settings)
    end

    render_account_settings(account_settings)
  end

  private

  def change_email_params
    params.permit(:email)
  end

  def validate_code_params
    params.permit(:code)
  end

  def patch_settings_params
    params.permit(
      :home_latitude,
      :home_longitude,
      :mobile_monthly_cost,
      :fixed_expected_download,
      :fixed_expected_upload,
      :fixed_monthly_cost
    )
  end

  def render_account_settings(settings)
    data = settings.as_json(except: [:home_lonlat, :id, :user_id])
    data[:home_latitude] = settings.home_lonlat.latitude
    data[:home_longitude] = settings.home_lonlat.longitude
    return render json: data, status: 200
  end
 end
end
