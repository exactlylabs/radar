class LocationClientsController < ApplicationController
  before_action :authenticate_user!
  before_action :check_account_presence, only: %i[ index ]
  before_action :set_location

  # GET /clients
  def index
    @clients = @location.clients
    respond_to do |format|
      format.turbo_stream { render turbo_stream: turbo_stream.update(@clients) }
      format.html
    end
  end

  private
  def set_location
    @location = policy_scope(Location).find(params[:location_id])
  end
end
