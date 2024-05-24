# frozen_string_literal: true

class ClientConnectivityEventsMailer < ApplicationMailer
  def pod_offline
    @client = params[:client]
    @offline_at = params[:offline_at]
    attachments.inline["new-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-logo.png")
    attachments.inline["download-ready-icon.png"] = File.read("#{Rails.root}/app/assets/images/download-ready-icon.png")
    mail(to: @user.email, subject: 'Your download is ready')
  end
end
