class UsersAccountController < ApplicationController
  before_action :authenticate_user!

  def index
    # Sorting here instead of in the view because I want users to appear first, then invites
    # each of those lists individually sorted by first_name
    users_for_account = policy_scope(User).select("users.*, users_accounts.joined_at, users_accounts.invited_at").order("LOWER(first_name)")
    invited_users = policy_scope(Invite).order("LOWER(first_name)")
    respond_to do |format|
      format.html { render "users/index", locals: { users: users_for_account, invited_users: invited_users } }
    end
  end

  def show
    if params[:type] == 'User'
      user = policy_scope(User).select("users.*, joined_at").find(params[:id])
    else
      user = policy_scope(Invite).find(params[:id])
    end

    respond_to do |format|
      if user
        format.html { render "users/show", locals: { user: user } }
      else
        raise ActiveRecord::RecordNotFound.new("Couldn't find User with 'id'=#{params[:id]}", params[:type], params[:id])
      end
    end
  end

  def destroy
    current_account_id = current_account.id
    user_to_remove_id = params[:id]
    if params[:type] == 'User'
      entity_to_remove = policy_scope(UsersAccount).where(user_id: user_to_remove_id, account_id: current_account_id).first
    else
      entity_to_remove = policy_scope(Invite).where(id: user_to_remove_id, account_id: current_account_id).first
    end
    respond_to do |format|
      if entity_to_remove.destroy
        format.html { redirect_to users_account_index_path, locals: { notice: "User removed successfully" } }
      else
        format.html { redirect_back fallback_location: root_path, notice: "Error removing user."  }
      end
    end
  end
end