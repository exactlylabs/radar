require "net/http"
require "json"

class PublicController < PublicApplicationController
  layout "landing", only: [:landing]
  after_action :send_event_to_amplitude, only: [:landing]

  def supported_browsers
  end

  def landing
  end

  def get_started_modal
    if params[:submission_id].present?
      @submission = PublicPageContactSubmission.find(params[:submission_id])
    else
      @submission = PublicPageContactSubmission.new
    end
  end

  def get_started_modal_step_1_submit
    if params[:submission][:id].present?
      @submission = PublicPageContactSubmission.find(params[:submission][:id])
    else
      @submission = PublicPageContactSubmission.new
    end
    @submission.first_name = params[:submission][:first_name]
    @submission.last_name = params[:submission][:last_name]
    @submission.email = params[:submission][:email]
    @submission.phone_number = params[:submission][:phone_number]
    if params[:submission][:other_state].present?
      @submission.state = params[:submission][:other_state].capitalize
    else
      @submission.state = params[:submission][:state].capitalize
    end
    if params[:submission][:other_county].present?
      @submission.county = params[:submission][:other_county].capitalize
    else
      @submission.county = params[:submission][:county].capitalize
    end
    @submission.consumer_type = params[:submission][:consumer_type].to_i
    @submission.business_name = params[:submission][:business_name]
    respond_to do |format|
      if @submission.save
        format.turbo_stream
      else
        render :get_started_modal
      end
    end
  end

  def get_started_modal_step_2
  end

  def get_started_modal_step_2_submit
    @submission = PublicPageContactSubmission.find(params[:submission][:id])
    @submission.isp = params[:submission][:isp]
    @submission.connection_type = params[:submission][:connection_type].to_i
    @submission.download_speed = params[:submission][:download_speed]
    @submission.upload_speed = params[:submission][:upload_speed]
    @submission.connection_placement = params[:submission][:connection_placement]&.to_i || nil
    @submission.service_satisfaction = params[:submission][:service_satisfaction]&.to_i || nil
    respond_to do |format|
      if @submission.save
        begin
          PublicSubmissionMailer.with(submission: @submission).new_submission.deliver_later
        rescue => e
          Sentry.capture_exception(e)
        end
        format.turbo_stream
      else
        render :get_started_modal
      end
    end
  end

  private
  def public_page_contact_submission_params
    params.require(:submission)
          .permit(:id, :first_name, :last_name,
                  :email, :phone_number, :state,
                  :county, :consumer_type, :connection_type,
                  :service_satisfaction, :comments, :business_name,
                  :isp, :download_speed, :upload_speed, :number_of_connections)
  end

  def send_event_to_amplitude
    return unless Rails.env.production?
    comes_from_toolkit = params[:origin] == 'toolkit'
    url = URI("https://api2.amplitude.com/2/httpapi")
    headers = {
      "Content-Type" => "application/json",
      "Accept" => "*/*",
    }
    data = {
      "api_key": ENV['AMPLITUDE_API_KEY'],
      "events": [{
                   "device_id": request.remote_ip,
                   "event_type": "Visit TBP page",
                   "ip": request.remote_ip,
                   "event_properties": {
                     "comes_from_toolkit": comes_from_toolkit,
                     "marketing_asset": params[:r],
                   }
                 }],
    }.to_json

    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(url, headers)
    request.body = data
    begin
      http.request(request)
    rescue => e
      Sentry.capture_exception(e)
    end
  end
end
