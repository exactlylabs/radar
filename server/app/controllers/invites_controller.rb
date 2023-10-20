class InvitesController < ApplicationController
  before_action :authenticate_user!
  before_action :check_user_is_allowed

  def create
    invite = params[:invite]
    if FeatureFlagHelper.is_available('roles', current_user)
      if invite[:email].blank?
        respond_to do |format|
          format.html { redirect_back fallback_location: root_path, status: :unprocessable_entity, notice: "Error processing new invite request. Please try again." }
        end
        return # Required to stop method execution from proceeding
      end
    else
      if invite[:first_name].blank? || invite[:last_name].blank? || invite[:email].blank?
        respond_to do |format|
          format.html { redirect_back fallback_location: root_path, status: :unprocessable_entity, notice: "Error processing new invite request. Please try again." }
        end
        return # Required to stop method execution from proceeding
      end
    end
    
    # Need to check if there is already an invite created for this 
    # account with the given email and prevent dups as well as already
    # registered users in the account (invite was used)
    duplicate_invite_error = false
    already_created_invite = policy_scope(Invite).find_by_email(invite[:email])
    already_added_user = policy_scope(UsersAccount).joins(:user).where(user: { email: invite[:email] })
    if already_created_invite.present? || already_added_user.present?
      duplicate_invite_error = true
    end
    account_to_use = current_account.is_all_accounts? || invite[:account_id].present? ? policy_scope(Account).find(invite[:account_id]) : current_account
    if !duplicate_invite_error
      @new_invite = Invite.new invite_params
      @new_invite.role = params[:invite][:role].to_i
      @new_invite.account = account_to_use
      @new_invite.sent_at = Time.now
      secret = SecretsHelper.create_secret(16)
      @new_invite.token = secret
    end
    respond_to do |format|
      if !duplicate_invite_error && @new_invite.save
        token = "#{@new_invite.id}#{secret}"
        InviteMailer.with(invite: @new_invite, account: account_to_use, token: token).invite_email.deliver_later
        @notice = "Invite was successfully created."
        format.turbo_stream
        format.html { redirect_back fallback_location: root_path, notice: @notice }
      else
        format.html { redirect_back fallback_location: root_path, status: :unprocessable_entity, notice: duplicate_invite_error ? "Error: There is already an Invite with the given email!" : "There has been an error creating the Invite! Please try again later." }
      end
    end
  end

  def resend
    # Not handling this with a before_action like set_invite as this is 
    # triggered as a POST request from a button and although an exception 
    # could be raised, it fails silently on the console and triggers a new
    # GET request to the original url, missing the actual error notice.
    invite_not_found_error = false
    begin
      invite = policy_scope(Invite).find(params[:id])
    rescue Exception => e
      invite_not_found_error = true
    end
    secret = SecretsHelper.create_secret(16)
    respond_to do |format|
      if invite_not_found_error
        format.html { redirect_back fallback_location: root_path, notice: "Error: There is no Invite with given id." }
      elsif invite.update(token: secret, sent_at: Time.now)
        token = "#{invite.id}#{secret}"
        InviteMailer.with(invite: invite, account: current_account, token: token).invite_email.deliver_later
        format.html { redirect_back fallback_location: root_path, notice: "Invite email was successfully re-sent." }
      else
        format.html { redirect_back fallback_location: root_path, notice: "Error resending invite!" }
      end
    end
  end

  private
  def invite_params
    params.require(:invite).permit(:first_name, :last_name, :email, :account_id)
  end

  def check_user_is_allowed
    unless UsersAccount.is_user_allowed(current_account.id, current_user.id)
      head(401)
    end
  end
end