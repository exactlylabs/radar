class ApplicationController < ActionController::Base
  include Pundit

  before_action :set_sentry_user
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :set_account_cookie_and_return_account
  before_action :set_accounts

  def after_sign_in_path_for(resource)
    dashboard_path
  end
  protected

  def set_sentry_user
    Sentry.set_user(id: current_user.id, email: current_user.email) if current_user
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :terms)}
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :current_password)}
  end

  def set_accounts
    @accounts = current_user.accounts
  end

  def set_account_cookie_and_return_account
    return if !current_user
    current_saved_account_id = cookies[:radar_current_account_id]
    # Check if current set account id is ok with current user
    if current_saved_account_id && policy_scope(UsersAccount).where(account_id: current_saved_account_id.to_i).count == 1
      @current_account = Account.find(current_saved_account_id.to_i)
    else
      current_account_id = UsersAccount.where(user_id: current_user.id).first.account_id
      @current_account = Account.find(current_account_id)
      cookies[:radar_current_account_id] = @current_account.id
    end
    @current_account
  end
end
