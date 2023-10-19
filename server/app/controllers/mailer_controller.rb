# frozen_string_literal: true

class MailerController < ApplicationController
  def redirect_to_ttuhsc
    redirect_to 'https://www.ttuhsc.edu/rural-health/tbp.aspx'
  end

  def redirect_campaign_to_ttuhsc
    @mailer_target = MailerTarget.new
    @mailer_target.campaign_id = params[:id]
    @mailer_target.ip = request.remote_ip
    @mailer_target.save
    redirect_to_ttuhsc
  end
end
