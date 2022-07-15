class ApplicationController < ActionController::Base
  include Pundit

  before_action :set_sentry_user
  before_action :configure_permitted_parameters, if: :devise_controller?

  def after_sign_in_path_for(resource)
    dashboard_path
  end

  def current_account
    cookie_account_id = get_cookie(:radar_current_account_id)
    return @current_account if @current_account&.id == cookie_account_id
    get_or_set_account_from_cookie
    @current_account
  end

  def set_user_account(new_account)
    @current_account = new_account
    @current_user_account = current_user.users_accounts.find_by_account_id(new_account.id)
  end

  def set_cookie(key, value)
    cookies[key] = value
  end

  def get_cookie(key)
    cookies[key]
  end

  helper_method :current_account

  protected

  def get_or_set_account_from_cookie
    account_id = get_cookie(:radar_current_account_id)
    begin
      if account_id
        @current_user_account = current_user.users_accounts.find_by_account_id(account_id)
        @current_account = current_user.accounts.find(account_id)
      elsif current_user.users_accounts.length > 0
        @current_user_account = current_user.users_accounts.first
        @current_account = current_user.accounts.find(@current_user_account.account_id)
        set_cookie(:radar_current_account_id, @current_user_account.account_id)
      else
        # We fall into this case if the current_user has no record
        # of a user_account association in the DB (empty account state).
        @current_user_account = nil
        @current_account = nil
        set_cookie(:radar_current_account_id, nil)
      end
    rescue ActiveRecord::RecordNotFound
      @current_user_account = nil
      @current_account = nil
      set_cookie(:radar_current_account_id, nil)
    end
  end

  def pundit_user
    return nil unless current_user
    return @current_user_account if @current_user_account
    get_or_set_account_from_cookie
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