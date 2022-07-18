class ApplicationController < ActionController::Base
  include Pundit

  before_action :set_sentry_user
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :accounts

  def after_sign_in_path_for(resource)
    dashboard_path
  end

  def current_account
    return unless cookies[:radar_current_account_id] && current_user
    account_policy_instance = AccountPolicy::Scope.new(current_user, Account, cookies[:radar_current_account_id])
    @current_account = account_policy_instance.resolve
    # If cookie account id was invalid for user,
    # overriding it with a valid one, and replacing cookie value
    if @current_account.nil?
      @current_account = account_policy_instance.get_default_account
      if @current_account
        cookies[:radar_current_account_id] = @current_account.id
      else
        # Maybe the user has no current accounts associated
        cookies[:radar_current_account_id] = nil
      end
    end
    @current_account
  end

  def accounts
    @accounts ||= current_user.accounts.not_deleted if current_user
  end

  protected

  def set_sentry_user
    Sentry.set_user(id: current_user.id, email: current_user.email) if current_user
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :terms)}
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :current_password)}
  end
end