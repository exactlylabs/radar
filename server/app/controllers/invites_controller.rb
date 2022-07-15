class InvitesController < ApplicationController
  before_action :authenticate_user!
  before_action :check_user_is_allowed
  before_action :set_current_account

  def create
    new_invite = Invite.new invite_params
    new_invite.account = @current_account
    new_invite.sent_at = Time.now
    all_characters = [('a'..'z'), ('A'..'Z'), (0..9)].map(&:to_a).flatten
    secret = (0...16).map { all_characters[rand(all_characters.length)] }.join
    new_invite.token = secret
    respond_to do |format|
      if new_invite.save
        token = "#{new_invite.id}#{secret}"
        InviteMailer.with(invite: new_invite, account: @current_account, token: token).invite_email.deliver_later
        format.html { redirect_back fallback_location: root_path, notice: "Invite was successfully created." }
      else
        format.json { render :root_path, status: :unprocessable_entity }
      end
    end
  end

  def resend
    invite = Invite.find_by_email(params[:email])
    all_characters = [('a'..'z'), ('A'..'Z'), (0..9)].map(&:to_a).flatten
    secret = (0...16).map { all_characters[rand(all_characters.length)] }.join
    respond_to do |format|
      if invite.update(token: secret, sent_at: Time.now)
        token = "#{invite.id}#{secret}"
        InviteMailer.with(invite: invite, account: @current_account, token: token).invite_email.deliver_later
        format.html { redirect_back fallback_location: root_path, notice: "Email was successfully sent." }
      else
        format.json { render :root_path, status: :unprocessable_entity }
      end
    end
  end

  private
  def invite_params
    params.require(:invite).permit(:first_name, :last_name, :email)
  end

  def check_user_is_allowed
    unless UsersAccount.is_user_allowed(current_account.id, current_user.id)
      head(401)
    end
  end

  def set_current_account
    @current_account = current_account
  end
end