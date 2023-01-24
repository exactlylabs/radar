class InviteMailer < ApplicationMailer
  def invite_email
    @invite = params[:invite]
    @token = params[:token]
    @account = params[:account]
    attachments.inline["new-radar-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-radar-logo.png")
    attachments.inline["illustration@3x.png"] = File.read("#{Rails.root}/app/assets/images/illustration@3x.png")
    mail(to: @invite.email, subject: 'Invitation to Radar')
  end
end