class LocationClientsController < ApplicationController
  include Paginator 
  before_action :authenticate_user!
  before_action :check_account_presence, only: %i[ index ]
  before_action :set_location

  # GET /clients
  def index
    @clients = @location.clients
    if FeatureFlagHelper.is_available('networks', current_user)
      status = params[:status]
      @clients = @clients.where(online: status == 'online') if status.present?
      @total = @clients.count

      @clients = paginate(@clients, params[:page], params[:page_size])
    end
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
