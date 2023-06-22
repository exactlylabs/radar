class UsersAccountController < ApplicationController
  before_action :authenticate_user!

  def index
    # Sorting here instead of in the view because I want users to appear first, then invites
    # each of those lists individually sorted by first_name
    account_id = params[:account_id]
    if account_id
      users_accounts = policy_scope(UsersAccount).includes(:user).where(account_id: account_id).order("users.first_name")
      invited_users = policy_scope(Invite).where(account_id: account_id).order("LOWER(first_name)")
    else
      users_accounts = policy_scope(UsersAccount).includes(:user).order("users.first_name")
      invited_users = policy_scope(Invite).order("LOWER(first_name)")
    end

    # Array-based pagination
    elements = [*users_accounts, *invited_users]
    page_size = params[:page_size].present? ? params[:page_size].to_i : 10
    page = params[:page].present? ? (params[:page].to_i - 1) : 0
    elements = elements.drop(page * page_size).first(page_size)

    respond_to do |format|
      format.html { render "users/index", locals: { elements: elements } }
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

    respond_to do |format|
      if entity && entity_type == 'UsersAccount'
        format.html { render "users/show_user_account", locals: { user_account: entity } }
      elsif entity && entity_type == 'Invite'
        format.html { render "users/show_invitee", locals: { invitee: entity } }
      else
        raise ActiveRecord::RecordNotFound.new("Couldn't find User with 'id'=#{params[:id]}", params[:type], params[:id])
      end
    end
  end

  def destroy
    entity_to_remove_id = params[:id]
    entity_type = params[:type]
    if entity_type == 'UsersAccount'
      entity_to_remove = policy_scope(UsersAccount).find(entity_to_remove_id)
    else
      entity_to_remove = policy_scope(Invite).find(entity_to_remove_id)
    end
    respond_to do |format|
      if entity_to_remove.destroy
        # If the user is removing itself from the users table
        # then reassign the current_account to the first available if any
        if entity_type == 'UsersAccount' && entity_to_remove.user_id == current_user.id && !current_account.is_all_accounts?
          get_first_user_account_and_set_cookie
          format.html { redirect_to "/dashboard", locals: { notice: "User removed successfully" } }
        else
          format.html { redirect_to users_account_index_path, locals: { notice: "User removed successfully" } }
        end
      else
        format.html { redirect_back fallback_location: root_path, notice: "Error removing user."  }
      end
    end
  end
end