class DashboardController < ApplicationController
  before_action :authenticate_user!

  # GET /dashboard or /dashboard.json
  def index
    @clients = policy_scope(Client)
    @locations = get_filtered_locations(policy_scope(Location), params[:filter])
    
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
      with_no_clients = locations.where_no_clients # need to also query for locations without clients associated
      offline = locations.where_offline
      with_no_clients + offline # return one list with both results
    end
  end
end
