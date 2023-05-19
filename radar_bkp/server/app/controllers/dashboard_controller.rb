class DashboardController < ApplicationController
  before_action :authenticate_user!

  # GET /dashboard or /dashboard.json
  def index
    @clients = policy_scope(Client)
    locations_to_filter = policy_scope(Location)
    @locations = get_filtered_locations(locations_to_filter, params[:filter])
    if @locations.exists? || params[:filter].present?
      @onboard_step = -1
    elsif @clients.exists?
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
