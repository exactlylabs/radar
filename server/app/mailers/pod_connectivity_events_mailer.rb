# frozen_string_literal: true

class PodConnectivityEventsMailer < ApplicationMailer
  def pod_offline_email
    @user = params[:user]
    @client = params[:client]
    @offline_at = params[:offline_at]
    attachments.inline["new-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-logo.png")
    attachments.inline["pod-offline-rounded-icon.png"] = File.read("#{Rails.root}/app/assets/images/pod-offline-rounded-icon.png")
    attachments.inline["isp-outage.png"] = File.read("#{Rails.root}/app/assets/images/isp-outage.png")
    mail({
           to: 'johndoe@gmail.com',
           from: 'john@gmail.com',
           subject: 'pod_offline_email'
         })
  end

  def pod_partially_offline_email
    @user = params[:user]
    @client = params[:client]
    @online_at = params[:online_at]
    @offline_at = params[:offline_at]
    @is_wifi = params[:is_wifi] || true
    attachments.inline["new-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-logo.png")
    attachments.inline["pod-offline-rounded-icon.png"] = File.read("#{Rails.root}/app/assets/images/pod-offline-rounded-icon.png")
    attachments.inline["isp-outage.png"] = File.read("#{Rails.root}/app/assets/images/isp-outage.png")
    mail({
           to: 'johndoe@gmail.com',
           from: 'john@gmail.com',
           subject: 'pod_partially_offline_email'
         })
  end

  def pod_online_email
    @user = params[:user]
    @client = params[:client]
    @online_at = params[:online_at]
    @offline_at = params[:offline_at]
    attachments.inline["new-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-logo.png")
    attachments.inline["pod-online-rounded-icon.png"] = File.read("#{Rails.root}/app/assets/images/pod-online-rounded-icon.png")
    attachments.inline["green-check.png"] = File.read("#{Rails.root}/app/assets/images/green-check.png")
    mail({
           to: 'johndoe@gmail.com',
           from: 'john@gmail.com',
           subject: 'pod_online_email'
         })

  end

  def pod_partially_online_email
    @user = params[:user]
    @client = params[:client]
    @online_at = params[:online_at]
    @offline_at = params[:offline_at]
    @is_wifi = params[:is_wifi] || false
    attachments.inline["new-logo.png"] = File.read("#{Rails.root}/app/assets/images/new-logo.png")
    attachments.inline["pod-online-rounded-icon.png"] = File.read("#{Rails.root}/app/assets/images/pod-online-rounded-icon.png")
    attachments.inline["green-check.png"] = File.read("#{Rails.root}/app/assets/images/green-check.png")
    mail({
           to: 'johndoe@gmail.com',
           from: 'john@gmail.com',
           subject: 'pod_partially_online_email'
         })
  end

end
