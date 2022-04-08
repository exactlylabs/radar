class DashboardController < ApplicationController
  before_action :authenticate_user!

  # GET /dashboard or /dashboard.json
  def index
    @clients = policy_scope(Client)
    @locations = policy_scope(Location)
    if @locations.length > 0
      @onboard_step = -1
    elsif @clients.length > 0
      @onboard_step = 3
    else
      @onboard_step = 1
    end
  end
end
