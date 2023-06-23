class AllAccountsAccount
  attr_reader :id

  def initialize
    @id = -1
  end

  def name
    "All accounts"
  end

  def superaccount
    false
  end

  def superaccount?
    superaccount
  end

  def is_all_accounts?
    true
  end

  def get_share_state_string(scoped_shared_users_accounts)
    "N/A"
  end
end

class AuthenticationHolder
  attr_reader :user, :account

  def initialize(user, is_all_accounts=false, is_shared_account=false)
    @user, @is_all_accounts, @is_shared_account = user, is_all_accounts, is_shared_account
  end

  def is_all_accounts?
    @is_all_accounts
  end

  def is_shared_account?
    @is_shared_account
  end

  def set_all_accounts
    @is_all_accounts = true
    @account = AllAccountsAccount.new
    unset_shared_account
  end

  def unset_all_accounts
    @is_all_accounts = false
  end

  def set_shared_account
    @is_shared_account = true
    unset_all_accounts
  end

  def unset_shared_account
    @is_shared_account = false
  end

  def set_user(user)
    @user = user
  end

  def set_account(account)
    @account = account
  end
end

class ApplicationController < ActionController::Base
  include Pundit::Authorization
  include Turbo::Redirection

  before_action :set_sentry_user
  before_action :configure_permitted_parameters, if: :devise_controller?

  def after_sign_in_path_for(resource)
    dashboard_path
  end

  def current_account
    cookie_account_id = get_cookie(:radar_current_account_id)
    return @auth_holder.account if cookie_account_id.present? && @auth_holder&.account&.id == cookie_account_id
    get_or_set_account_from_cookie
    @auth_holder&.account
  end

  def set_new_account(new_account)
    assign_account(new_account.id)
  end

  def set_all_accounts
    @auth_holder = AuthenticationHolder.new(current_user) unless @auth_holder
    @auth_holder.set_all_accounts
    set_cookie(:radar_current_account_id, -1)
  end

  def assign_account(account_id)
    if is_all_accounts_id(account_id)
      set_all_accounts
    else
      # Check if user has acces to given account, and define if it is an active user
      # or it can access due to account delegation
      is_account_accessible_through_share = current_user.shared_accounts.distinct.where(id: account_id).count == 1
      if current_user.super_user
        can_access_account = true
      else
        can_access_account =  is_account_accessible_through_share || current_user.accounts.where(id: account_id).count == 1  
      end

      raise Pundit::NotAuthorizedError, "Access denied" unless can_access_account
      
      set_cookie(:radar_current_account_id, account_id)
      @auth_holder.set_user(current_user) if @auth_holder.user.nil?
      @auth_holder.set_account(Account.find(account_id))
      if is_account_accessible_through_share
        @auth_holder.set_shared_account
      else
        @auth_holder.unset_shared_account
      end
    end
  end

  def clear_account_and_cookie
    @auth_holder = nil
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

  def is_all_accounts_id(account_id)
    account_id == -1 || account_id == "-1"
  end

  def get_or_set_account_from_cookie
    return nil unless current_user
    account_id = get_cookie(:radar_current_account_id)
    begin
      @auth_holder = AuthenticationHolder.new(current_user, false, false) unless @auth_holder
      if account_id
        if is_all_accounts_id(account_id)
          set_all_accounts
          return
        end
        assign_account(account_id)
        # If @auth_holder.account is nil could be because:
        # 1. account_id is not present in users_accounts list
        # 2. user_account with given id exists but was soft deleted
        # So then, replace it with the first available option for the user
        if !@auth_holder.account
          get_first_user_account_and_set_cookie
        end
      elsif current_user.users_accounts.not_deleted.length > 0
        get_first_user_account_and_set_cookie
      else
        # We fall into this case if the current_user has no record
        # of a user_account association in the DB (empty account state).
        clear_account_and_cookie
      end
    rescue ActiveRecord::RecordNotFound
      clear_account_and_cookie
    end
  end

  def pundit_user
    return nil unless current_user
    return @auth_holder if @auth_holder
    get_or_set_account_from_cookie
    @auth_holder
  end

  def set_sentry_user
    Sentry.set_user(id: current_user.id, email: current_user.email) if current_user
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :terms)}
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:first_name, :last_name, :email, :password, :password_confirmation, :current_password)}
  end

  def get_first_user_account_and_set_cookie
    first_user_account = current_user.users_accounts.not_deleted.first
    if first_user_account.nil?
      clear_account_and_cookie
    else
      @auth_holder.set_account(current_user.accounts.find(first_user_account.account_id))
      set_cookie(:radar_current_account_id, first_user_account.account_id)
    end
  end

end