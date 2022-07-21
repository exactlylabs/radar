class ApplicationController < ActionController::Base
  include Pundit

  before_action :set_sentry_user
  before_action :configure_permitted_parameters, if: :devise_controller?

  def after_sign_in_path_for(resource)
    dashboard_path
  end

  def current_account
    return @current_account if @current_account && @current_account.id == cookies[:radar_current_account_id]
    begin
      @current_account = policy_scope(Account).find(cookies[:radar_current_account_id])
    rescue ActiveRecord::RecordNotFound
      @current_account = nil
      cookies[:radar_current_account_id] = nil
    ensure
      @current_account
    end
  end

  helper_method :current_account

  protected

  def pundit_user
    return unless current_user
    return @current_user_account if @current_user_account
    # if @current_user_account is null, the cookie might be
    # outdated or wrong, so defaulting to first UserAccount
    # for current_user
    @current_user_account = current_user.users_accounts.not_deleted.first if @current_user_account.nil?
  end

  def set_sentry_user
    Sentry.set_user(id: current_user.id, email: current_user.email) if current_user
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :terms)}
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :current_password)}
  end
end