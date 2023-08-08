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

  def get_add_pod_to_network_modal
    @add_type = params[:add_type] || 'new_pod'
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def get_add_existing_pod_to_network_modal
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def get_add_new_pod_to_network_modal
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def add_existing_pod_to_network
    @client = policy_scope(Client).find_by_unix_user(params[:pod_id])
    respond_to do |format|
      if @client.update(location_id: @location.id, account_id: @location.account.id)
        format.turbo_stream
        format.html
      else
        format.html { render :get_add_existing_pod_to_network_modal, status: :unprocessable_entity, notice: "Oops! There has been an error moving the pod to this network. Please try again later." }
      end
    end
  end

  def add_new_pod_to_network
    @unix_user = params[:pod_id]
    @client = Client.find_by_unix_user(@unix_user)
    @error = nil
    if !@client
      @error = ErrorsHelper::PodClaimErrors::PodNotFound
    elsif @client.user.present?
      @error = ErrorsHelper::PodClaimErrors::PodAlreadyClaimed
    else
      @client.user = current_user
      @client.location = @location
      @client.name = nil
      @client.account = @location.account
      @client.save!
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  private
  def set_location
    @location = policy_scope(Location).find(params[:location_id])
  end
end
