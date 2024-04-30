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

  def redirect_go_campaign
    state = params[:state]
    if state.present?
      source = params[:source]
      date = params[:date]
      parsed_date = DateTime.strptime(date, '%m%d%Y') if date.present?
      payload = {
        state: state,
        date: parsed_date,
        source: source
      }
      @mailer_target = MailerTarget.new
      @mailer_target.campaign_id = [state, source, date].compact.join('_')
      @mailer_target.ip = request.remote_ip
      @mailer_target.origin = params[:origin]
      @mailer_target.payload = payload
      @mailer_target.save
      redirect_go_campaign_based_on_state(state)
    else
      redirect_back fallback_location: '/'
    end
  end

  private

  def redirect_go_campaign_based_on_state(state)
    case state
    when 'Alaska'
      redirect_to 'https://telehealthtechnology.org/speed/'
    when 'Michigan'
      redirect_to 'https://www.cmich.edu/offices-departments/office-information-technology/telehealth-broadband-pilot-program'
    when 'Texas'
      redirect_to 'https://www.ttuhsc.edu/rural-health/tbp.aspx'
    when 'WestVirginia'
      redirect_to 'https://pods.radartoolkit.com/TBP'
    else
      redirect_back fallback_location: '/'
    end
  end
end
