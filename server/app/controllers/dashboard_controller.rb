class DashboardController < ApplicationController
  before_action :authenticate_user!

  # GET /dashboard or /dashboard.json
  def index
    @clients = Client.for_current_account(cookies[:radar_current_account_id])
    @locations = get_filtered_locations(Location.for_current_account(cookies[:radar_current_account_id]), params[:filter])
    if @locations.length > 0 || params[:filter].present?
      @onboard_step = -1
    elsif @clients.length > 0
      @onboard_step = 3
    else
      @onboard_step = 1
    end
  end

  private

  def get_filtered_locations(locations, filter)
    case filter
    when nil, 'all'
      locations
    when 'active'
      locations.where_online
    else
      locations.where_offline
    end
  end
end
