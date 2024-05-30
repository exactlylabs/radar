module Onboarding extend ActiveSupport::Concern
  def set_onboarding_step
    if @locations.exists? || params[:filter].present?
      @onboard_step = -1
    elsif @clients.exists?
      @onboard_step = 3
    else
      @onboard_step = 1
    end
  end
end