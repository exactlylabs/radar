class InviteMailerPreview < ActionMailer::Preview
  def invite_email
    account = Account.first
    invite = Invite.first
    token = 'test123xyz'
    InviteMailer.with(invite: invite, account: account, token: token).invite_email
  end
end