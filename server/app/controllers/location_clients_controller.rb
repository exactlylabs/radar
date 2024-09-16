class LocationClientsController < ApplicationController
  include Paginator
  before_action :authenticate_user!
  before_action :check_account_presence, only: %i[ index ]
  before_action :set_location

  # GET /clients
  def index
    @clients = @location.clients
    status = params[:status]
    query = params[:query]
    @clients = @clients.where(online: status == 'online') if status.present?
    @total = @clients.count
    @clients = @clients.where("unix_user ILIKE ?", "%#{query}%") if query.present?

    @clients = paginate(@clients, params[:page], params[:page_size])

    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  private

  def set_location
    @location = policy_scope(Location).find(params[:location_id])
  end
end

