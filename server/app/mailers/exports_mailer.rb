class ExportsMailer < ApplicationMailer
  def export_ready_email
    @user = params[:user]
    @url = params[:url]
    attachments.inline["new-radar-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-radar-logo.png")
    attachments.inline["downloads-icon.png"] = File.read("#{Rails.root}/app/assets/images/downloads-icon.png")
    attachments.inline["download-archive-white.svg"] = File.read("#{Rails.root}/app/assets/images/download-archive-white.svg")
    mail(to: @user.email, subject: 'Your download is ready')
  end

  def export_error_email
    @user = params[:user]
    attachments.inline["new-radar-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-radar-logo.png")
    mail(to: @user.email, subject: 'There has been an error processing your download')
  end
end
