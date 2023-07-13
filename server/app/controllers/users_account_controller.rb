require "./app/controllers/helpers/unified_member.rb"

class UsersAccountController < ApplicationController
  include Paginator
  before_action :authenticate_user!
  before_action :check_account_presence

  def index
    # Sorting here instead of in the view because I want users to appear first, then invites
    # each of those lists individually sorted by first_name
    account_id = params[:account_id]
    status = params[:status]
    order = params[:order].present? ? "#{params[:order].upcase}" : nil

    if account_id && account_id != "-1" # -1 is the value for all accounts
      users_accounts = policy_scope(UsersAccount).includes(:user).where(account_id: account_id) unless status == 'pending'
      invited_users = policy_scope(Invite).where(account_id: account_id) unless status == 'joined'
    else
      users_accounts = policy_scope(UsersAccount).includes(:user) unless status == 'pending'
      invited_users = policy_scope(Invite) unless status == 'joined'
    end

    if order
      users_accounts = users_accounts.order("LOWER(users.first_name) #{order}").references(:users) unless status == 'pending'
      invited_users = invited_users.order("LOWER(first_name) #{order}") unless status == 'joined'
    end

    # Array-based pagination
    elements = [*users_accounts, *invited_users]
    
    # Unify users by email if currently all accounts is active
    elements = unify_users(elements) if current_account.is_all_accounts? 

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

  def all_accounts_profile
    email = params[:email]
    error = !email

    if email
      member_matches = policy_scope(UsersAccount).includes(:user).where(user: { email: email })
      invite_matches = policy_scope(Invite).where(email: email)
    end

    error ||= member_matches&.empty? && invite_matches&.empty?

    first_name = member_matches&.first&.user&.first_name
    last_name = member_matches&.first&.user&.last_name

    elements = [*member_matches, *invite_matches]

    total_count = elements.count

    order = params[:order].present? ? params[:order].upcase : nil

    elements = elements
    .sort { |a,b| 
      if order.nil? || order == "ASC" 
        a.account.name.downcase <=> b.account.name.downcase
      else
        b.account.name.downcase <=> a.account.name.downcase
      end
    }

    elements = paginate(elements, params[:page], params[:page_size])

    
    respond_to do |format|
      if !error
        format.html { 
          render template: "users/all_accounts_show", 
          locals: { 
            user_data: { 
              first_name: first_name, 
              last_name: last_name, 
              email: email 
            },
            elements: elements,
            total_count: total_count,
            accounts: (member_matches.map(&:account) + invite_matches.map(&:account))
          }
        }
      else
        format.html { redirect_to users_account_index_path, notice: "Error finding member." }
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
    user_deleted_itself = entity_type == 'UsersAccount' && entity_to_remove.user_id == current_user.id
    is_current_account_all_accounts = current_account.is_all_accounts?
    respond_to do |format|
      if entity_to_remove.destroy
        # If the user is removing itself from the users table
        # then reassign the current_account to the first available if any
        if user_deleted_itself && !is_current_account_all_accounts
          get_first_user_account_and_set_cookie
          format.html { redirect_to "/dashboard", notice: "Member removed successfully" }
        elsif 
        else
          format.html { redirect_back fallback_location: root_path, notice: "Member removed successfully" }
        end
      else
        format.html { redirect_back fallback_location: root_path, notice: "Error removing member."  }
      end
    end
  end

  def bulk_delete
    @users_to_delete_ids = JSON.parse(params[:users_ids]).map(&:to_i)
    @invites_to_delete_ids = JSON.parse(params[:invites_ids]).map(&:to_i)
    users_to_delete = policy_scope(UsersAccount).where(id: @users_to_delete_ids)
    invites_to_delete = policy_scope(Invite).where(id: @invites_to_delete_ids)
    
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

  private
  def unify_users(users_and_invites)
    users_and_invites
      .group_by { |entity| entity.is_a?(Invite) ? entity.email : entity.user.email }
      .sort
      .to_h
      .map { |email, entities| 
        UnifiedMember.new(
          email,
          User.find_by_email(email),
          Account.find( entities.map{ |entity| entity.account_id } )
        )
      }
  end
end