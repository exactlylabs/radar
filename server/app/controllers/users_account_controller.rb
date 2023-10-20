class UsersAccountController < ApplicationController
  include Paginator
  before_action :authenticate_user!
  before_action :check_account_presence

  def index
    # Sorting here instead of in the view because I want users to appear first, then invites
    # each of those lists individually sorted by first_name
    account_id = params[:account_id]
    status = params[:status]
    order = params[:order].present? ? params[:order].upcase.to_s : nil
    role = params[:role].present? ? UsersAccount.roles[params[:role]] : nil
    users_accounts = []
    invited_users = []

    if account_id && account_id != "-1" # -1 is the value for all accounts
      users_accounts = policy_scope(UsersAccount).not_deleted.includes(:user).where(account_id: account_id) unless status == 'pending'
      invited_users = policy_scope(Invite).where(account_id: account_id) unless status == 'joined'
    else
      users_accounts = policy_scope(UsersAccount).not_deleted.includes(:user) unless status == 'pending'
      invited_users = policy_scope(Invite) unless status == 'joined'
    end

    if FeatureFlagHelper.is_available('roles', current_user)
      if role.present?
        users_accounts = users_accounts.where(role: role)
        invited_users = invited_users.where(role: role)
      end

      # Adding user grouping by email
      grouped_user_accounts = {}
      users_accounts.each do |ua|
        if grouped_user_accounts.key?(ua.user.email)
          grouped_user_accounts[ua.user.email] << ua
        else
          grouped_user_accounts[ua.user.email] = [ua]
        end
      end
      invited_users.each do |invite|
        if grouped_user_accounts.key?(invite.email)
          grouped_user_accounts[invite.email] << invite
        else
          grouped_user_accounts[invite.email] = [invite]
        end
      end
    end

    if FeatureFlagHelper.is_available('roles', current_user) && current_account.is_all_accounts?
      if order
        grouped_user_accounts = grouped_user_accounts.sort_by { |email, _| email }.to_h
        grouped_user_accounts = grouped_user_accounts.reverse.to_h if order == 'DESC'
      end
    elsif order
      users_accounts = users_accounts.order("LOWER(users.first_name) #{order}").references(:users) unless status == 'pending'
      invited_users = invited_users.order("LOWER(first_name) #{order}") unless status == 'joined'
    end

    if FeatureFlagHelper.is_available('roles', current_user) && current_account.is_all_accounts?
      row_index = 0
      elements = grouped_user_accounts.map {|k, v| {
        index: row_index += 1,
        email: k,
        full_name: v.find {|user_or_invite| user_or_invite.is_a?(UsersAccount)}&.user&.full_name || '',
        accounts: v.map {|user_or_invite| user_or_invite.account},
      }}
    else
      # Array-based pagination
      elements = [*users_accounts, *invited_users]
    end

    # Get total variable for pagination
    total_elements = elements.count

    elements = paginate(elements, params[:page], params[:page_size])

    respond_to do |format|
      format.html { render "users/index", locals: { elements: elements, total: total_elements } }
    end
  end

  def shared
    respond_to do |format|
      format.html { render "users/shared" }
    end
  end

  def show
    entity_type = params[:type]
    if entity_type == 'UsersAccount'
      entity = policy_scope(UsersAccount).includes(:user).find(params[:id])
    else
      entity = policy_scope(Invite).find(params[:id])
    end

    raise ActiveRecord::RecordNotFound.new("Couldn't find User with 'id'=#{params[:id]}", params[:type], params[:id]) if !entity
    
    respond_to do |format|
      if entity && entity_type == 'UsersAccount'
        format.html { render template: "users/show_user_account", locals: { user_account: entity } }
      else
        format.html { render template: "users/show_invitee", locals: { invitee: entity } }
      end
    end
  end

  def all_accounts_show
    email = params[:email]
    @user_accounts = policy_scope(UsersAccount).includes(:user).where(users: { email: email })
    @invites = policy_scope(Invite).where(email: email)

    raise ActiveRecord::RecordNotFound.new("Couldn't find User with 'email'=#{params[:email]}", params[:email]) if @user_accounts.count == 0 && @invites.count == 0

    accounts = [*@user_accounts, *@invites]

    total_accounts = accounts.count
    account_names = accounts.map(&:account).map(&:name)
    accounts = paginate(accounts, params[:page], params[:page_size])

    @full_entity = {}
    @full_entity[:full_name] = @user_accounts.count > 0 ? @user_accounts.first.user.full_name : nil
    @full_entity[:email] = email
    @full_entity[:has_actual_user] = @user_accounts.count > 0
    @full_entity[:account_count] = total_accounts
    @full_entity[:account_names] = account_names
    @full_entity[:accounts] = accounts

    respond_to do |format|
      format.html { render template: "users/all_accounts_show" }
    end
  end

  def destroy
    entity_to_remove_id = params[:id]
    entity_type = params[:type]
    entity_to_remove = if entity_type == 'UsersAccount'
      policy_scope(UsersAccount).find(entity_to_remove_id)
    else
      policy_scope(Invite).find(entity_to_remove_id)
                       end
    user_deleted_itself = entity_type == 'UsersAccount' && entity_to_remove.user_id == current_user.id
    is_current_account_all_accounts = current_account.is_all_accounts?
    respond_to do |format|
      if entity_to_remove.destroy
        # If the user is removing itself from the users table
        # then reassign the current_account to the first available if any
        if user_deleted_itself && !is_current_account_all_accounts
          get_first_user_account_and_set_cookie
          format.html { redirect_to "/dashboard", locals: { notice: "Member removed successfully" } }
        else
          format.html { redirect_to users_account_index_path, locals: { notice: "Member removed successfully" } }
        end
      else
        format.html { redirect_back fallback_location: root_path, notice: "Error removing member."  }
      end
    end
  end

  def bulk_delete
    if FeatureFlagHelper.is_available('roles', current_user) && current_account.is_all_accounts?
      # ids are emails as they are grouped by it in all accounts view
      @users_to_delete_ids = JSON.parse(params[:users_ids])
      @invites_to_delete_ids = JSON.parse(params[:invites_ids])
      users_to_delete = policy_scope(UsersAccount).where(email: @users_to_delete_ids)
      invites_to_delete = policy_scope(Invite).where(email: @invites_to_delete_ids)
    else
      @users_to_delete_ids = JSON.parse(params[:users_ids]).map(&:to_i)
      @invites_to_delete_ids = JSON.parse(params[:invites_ids]).map(&:to_i)
      users_to_delete = policy_scope(UsersAccount).where(id: @users_to_delete_ids)
      invites_to_delete = policy_scope(Invite).where(id: @invites_to_delete_ids)
    end

    did_user_remove_itself = users_to_delete.map{|ua| ua.user_id}.include? current_user.id
    is_current_account_all_accounts = current_account.is_all_accounts?
    is_more_than_one_member = (users_to_delete.count + invites_to_delete.count) > 1

    respond_to do |format|
      # Using delete_all instead of destroy_all to keep their references
      # and update the screens after the action is completed
      if users_to_delete.destroy_all && invites_to_delete.destroy_all
        # If the user is removing itself from the users table
        # then reassign the current_account to the first available if any
        if did_user_remove_itself && !is_current_account_all_accounts
          get_first_user_account_and_set_cookie
          # Add status 303 to avoid DELETE to be proxied over to the redirected
          # url. From: https://api.rubyonrails.org/classes/ActionController/Redirecting.html#:~:text=If%20you%20are,a%20GET%20request.
          format.html { redirect_to "/dashboard", status: 303, notice: "#{is_more_than_one_member ? 'Members' : 'Member'} removed successfully" }
        else
          @notice = "#{is_more_than_one_member ? 'Members' : 'Member'} removed successfully"
          format.turbo_stream
        end
      else
        format.html { redirect_to users_account_index_path, notice: "Error removing members."  }
      end
    end
  end

  def get_add_member_modal
    respond_to do |format|
      format.html
    end
  end
end