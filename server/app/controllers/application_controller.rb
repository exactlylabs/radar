class ApplicationController < ActionController::Base
  include Pundit::Authorization # updated due to DEPRECATION WARNING from console
  include Turbo::Redirection

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
    assign_user_account(new_account.id)
  end

  def set_all_accounts
    @current_user_account = AllAccountsUser.new current_user.id
    @current_account = AllAccountsAccount.new
  end

  def assign_user_account(account_id)
    if account_id == -1 || account_id == "-1"
      set_all_accounts
    else
      is_account_accessible_through_share = current_user.shared_accounts.distinct.where(id: account_id).count == 1
      @current_user_account = is_account_accessible_through_share ? ShareGrantUser.new(account_id, current_user.id) : current_user.users_accounts.not_deleted.find_by_account_id(account_id)
      @current_account = current_user.accounts.where(id: account_id).first # Using where.first to avoid ActiveRecord::RecordNotFound exception
      @current_account = current_user.shared_accounts.where(id: account_id).first if !@current_account
    end
  end

  def clear_user_account_and_cookie
    @current_account = nil
    @current_user_account = nil
    cookies.delete :radar_current_account_id
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
        if account_id == -1 || account_id == "-1"
          set_all_accounts
          return
        end
        assign_user_account(account_id)
        # If @current_user_account is nil could be because:
        # 1. account_id is not present in users_accounts list
        # 2. user_account with given id exists but was soft deleted
        # So then, replace it with the first available option for the user
        if !@current_user_account
          get_first_user_account_and_set_cookie
        end
      elsif current_user.users_accounts.not_deleted.length > 0
        get_first_user_account_and_set_cookie
      else
        # We fall into this case if the current_user has no record
        # of a user_account association in the DB (empty account state).
        clear_user_account_and_cookie
      end
    rescue ActiveRecord::RecordNotFound
      clear_user_account_and_cookie
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

  def get_first_user_account_and_set_cookie
    @current_user_account = current_user.users_accounts.not_deleted.first
    if @current_user_account.nil?
      clear_user_account_and_cookie
    else
      @current_account = current_user.accounts.find(@current_user_account.account_id)
      set_cookie(:radar_current_account_id, @current_user_account.account_id)
    end
  end

end