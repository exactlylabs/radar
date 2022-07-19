class ApplicationController < ActionController::Base
  include Pundit

  before_action :set_sentry_user
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :accounts

  def after_sign_in_path_for(resource)
    dashboard_path
  end

  protected

  def accounts
    @accounts ||= current_user.accounts.not_deleted if current_user
  end

  def pundit_user
    return unless current_user
    @current_user_account ||= current_user.users_accounts.not_deleted.find_by_account_id(cookies[:radar_current_account_id])
    # if @current_user_account is null, the cookie might be
    # outdated or wrong, so defaulting to first UserAccount
    # for current_user
    @current_user_account = current_user.users_accounts.not_deleted.first if @current_user_account.nil?

    # If @current_user_account is null again, then this user
    # has no associated account currently, so we clear both
    # @current_account as well as the cookie itself.
    unless @current_account
      if @current_user_account
        @current_account ||= Account.find(@current_user_account.account_id)
        cookies[:radar_current_account_id] = @current_account.id
      else
        @current_account = nil
        cookies[:radar_current_account_id] = nil
      end
    end
    @current_user_account
  end

  def set_sentry_user
    Sentry.set_user(id: current_user.id, email: current_user.email) if current_user
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :terms)}
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :current_password)}
  end
end