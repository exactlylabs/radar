class ExportsMailer < ApplicationMailer
  def export_ready_email
    user = params[:user]
    @url = params[:url]
    mail(to: user.email, subject: 'Your download is ready')
  end
end