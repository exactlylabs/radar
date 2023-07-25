class ExportsMailer < ApplicationMailer
  def export_ready_email
    @user = params[:user]
    @url = params[:url]
    attachments.inline["new-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-logo.png")
    attachments.inline["download-ready-icon.png"] = File.read("#{Rails.root}/app/assets/images/download-ready-icon.png")
    mail(to: @user.email, subject: 'Your download is ready')
  end

  def export_error_email
    @user = params[:user]
    attachments.inline["new-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-logo.png")
    mail(to: @user.email, subject: 'There has been an error processing your download')
  end
end