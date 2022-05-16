class DashboardController < ApplicationController
  before_action :authenticate_user!

  # GET /dashboard or /dashboard.json
  def index
    @clients = policy_scope(Client)
    @locations = get_filtered_locations(policy_scope(Location), params[:filter])
    
    if @locations.length > 0
      @onboard_step = -1
    elsif @clients.length > 0
      @onboard_step = 3
    else
      @onboard_step = 1
    end
  end

  private
  def get_filtered_locations(locations, filter)
    if filter.nil? || filter == 'all'
      return locations
    end

    if filter == 'active'
      locations.select { |location| location.online? }
    else
      locations.reject { |location| location.online? }
    end
  end
end
