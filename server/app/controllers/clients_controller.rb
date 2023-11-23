require "sshkey"
require "rqrcode"

class ClientsController < ApplicationController
  include Recents
  include Paginator
  include RangeEvaluator
  before_action :check_account_presence, only: %i[ index show ]
  before_action :authenticate_user!, except: %i[ configuration new create status watchdog_status public_status check_public_status run_test run_public_test ]
  before_action :authenticate_client!, only: %i[ configuration status watchdog_status ], if: :json_request?
  before_action :check_request_origin, only: %i[ show ]
  before_action :set_client, only: %i[ release show edit destroy get_client_label toggle_in_service speed_average ]
  before_action :authenticate_token!, only: %i[ create status watchdog_status ]
  before_action :set_clients, only: %i[ bulk_run_tests bulk_delete bulk_update_release_group get_bulk_change_release_group get_bulk_remove_from_network bulk_remove_from_network get_bulk_move_to_network bulk_move_to_network ]
  skip_forgery_protection only: %i[ status watchdog_status configuration new create ]

  # GET /clients or /clients.json
  def index
    @status = params[:status]
    @account_id = params[:account_id]
    if @account_id && @account_id.to_i != -1
      if @account_id == 'none'
        @clients = policy_scope(Client).where_no_account
      else
        @clients = policy_scope(Client).where(account_id: @account_id)
      end
    else
      @clients = policy_scope(Client)
    end
    if @status
      @clients = @clients.where_online if @status == 'online'
      @clients = @clients.where_offline if @status == 'offline'
    end

    if FeatureFlagHelper.is_available('networks', current_user)
      @clients = @clients.where(update_group_id: params[:update_group_id]) if params[:update_group_id].present? && params[:update_group_id].to_i != -1
      @total = @clients.count
      @clients = @clients.sort { |x| x.location_id.nil? ? -1 : 1 } # Show pods without network first
      @clients = paginate(@clients, params[:page], params[:page_size])
    end
  end

  # GET /clients/1 or /clients/1.json
  def show
    account_id = current_account.id == -1 ? nil : current_account.id
    @total_avg = @client.get_speed_averages(account_id)
  end

  # GET /clients/new
  def new
    @client = Client.new
  end

  def new_pod_onboarding
    @client = Client.new
    respond_to do |format|
      format.turbo_stream
    end
  end

  # GET /clients/1/edit
  def edit
  end

  def claim_form
    @client = Client.new
    @location_id = params[:location_id] || nil
    @setup = params[:setup].present? && params[:setup] == 'true'
    if @setup
      possible_pod = Client.where(unix_user: params[:unix_user]).first
      if possible_pod.present? && possible_pod.account.nil?
        @unix_user = params[:unix_user]
      else
        redirect_to clients_path
      end
    end
    if FeatureFlagHelper.is_available('networks', current_user)
      @client = Client.find_by_unix_user(@unix_user)
      @location = Location.new
      respond_to do |format|
        format.turbo_stream
        format.html { render :get_add_pod_modal, status: :ok }
      end
    end
  end

  # Endpoint to be called from the public pod status page
  # allowing to run a test without the need for being authenticated
  # at all
  def run_public_test
    # Not using set_client as we are in a context of no auth, so
    # policy_scope(Client) will not work
    client_id = params[:id]
    @client = Client.find_by_unix_user(client_id)

    if !@client
      raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:id]}", Client.name, params[:id])
    end

    @client.request_test!

    respond_to do |format|
      format.html { redirect_back fallback_location: root_path }
    end
  end

  def run_test
    # Allow without a logged in user to request a test if id / secret is known
    client_id = params[:id]
    @secret = params[:secret]
    @client = Client.find_by_unix_user(client_id)&.authenticate_secret(@secret)

    # If no secret, then we need to authenticate
    if !@client
      authenticate_user!
      @client = Client.find_by_unix_user(params[:id])
      authorize @client, :superaccount_or_in_scope?
    end

    respond_to do |format|
      if @client.update(test_requested: true)
        if FeatureFlagHelper.is_available('networks', current_user)
          @notice = "Pod speed test requested successfully."
          format.turbo_stream
        else
          @notice = "Client test requested."
          format.turbo_stream {}
        end
        format.html { redirect_back fallback_location: root_path, notice: @notice }
        format.json { render :show, status: :ok, location: clients_path(@client.unix_user) }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @client.errors, status: :unprocessable_entity }
      end
    end
  end

  def check_claim
    @client_id = params[:id]
    @client = Client.find_by_unix_user(@client_id)
    respond_to do |format|
      if !@client
        format.json { render json: {msg: 'Client not found!'}, status: :not_found }
      elsif @client.user.present?
        format.json { render json: {msg: 'Client already claimed!'}, status: :bad_request }
      elsif @client.user.nil?
        format.json { render json: @client.to_json, status: :ok }
      else
        format.json { render json: {}, status: :unprocessable_entity }
      end
    end
  end

  def claim
    @client_id = params[:id]
    @location_id = params[:location_id]
    @client_name = params[:name]
    @account = params[:account_id].present? ? policy_scope(Account).find(params[:account_id]) : current_account

    location = policy_scope(Location).where(id: @location_id).first if @location_id.present?
    @client = Client.find_by_unix_user(@client_id)
    respond_to do |format|
      if @client && !@client.user
        @client.user = current_user
        @client.location = location
        @client.name = @client_name
        @client.account = @account
        @client.save
        format.turbo_stream
        format.json { render :show, status: :ok, location: client_path(@client.unix_user) }
      else
        @error = true
        format.html { render :claim_form, status: :unprocessable_entity }
        format.json { render json: {}, status: :unprocessable_entity }
      end
    end
  end

  def claim_pod_onboarding
    @client_id = params[:id]
    @location_id = params[:location_id]
    @client_name = params[:name]
    @account = params[:account_id].present? ? policy_scope(Account).find(params[:account_id]) : current_account

    location = policy_scope(Location).where(id: @location_id).first if @location_id.present?
    @client = Client.find_by_unix_user(@client_id)
    if @client && !@client.user
      @client.user = current_user
      @client.location = location
      @client.name = @client_name
      @client.account = @account
      @client.save
    else
      @error = true
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def release
    @location_before_release = @client.location
    respond_to do |format|
      if @client.update(user: nil, location: nil, account: nil)
        remove_recent_search(@client.id, Recents::RecentTypes::CLIENT)
        if request.referrer.include?(client_path(@client.unix_user))
          format.html { redirect_to clients_path, notice: "Client was successfully deleted." }  
        else
          format.html { redirect_back fallback_location: root_path, notice: "Client was successfully deleted." }
        end
        format.turbo_stream
        format.json { head :no_content }
      end
    end
  end

  def public_status
  end

  def check_public_status
    client_id = params["id"]
    @secret = params["secret"]

    @client = Client.find_by_unix_user(client_id)&.authenticate_secret(@secret)
  end

  def status
    @client.pinged_at = Time.now
    @client.raw_version = params[:version]
    @client.distribution_name = params[:distribution]
    @client.ip = request.ip
    @client.network_interfaces = JSON.parse(params[:network_interfaces]) unless params[:network_interfaces].nil?
    @client.os_version = params[:os_version]
    @client.hardware_platform = params[:hardware_platform]
    if !params[:version].nil?
      # Check client Version Id
      version_ids = ClientVersion.where(version: params[:version]).pluck(:id)
      if version_ids.length == 0
        # No version found
        version_id = nil
      else
        # pluck returns an array
        version_id = version_ids[0]
      end
      @client.client_version_id = version_id
    end
    if @client.test_scheduled_at.nil?
      @client.schedule_next_test!
    end
    @client.record_event(Client::Events::SERVICE_STARTED, {}, @client.pinged_at) if params[:service_first_ping].present? && params[:service_first_ping] == "true"
    ClientEventLog.service_started_event @client if params[:service_first_ping].present? && params[:service_first_ping] == "true"
    @client.compute_ping!
    @client.save!
    if !@client.online
      @client.connected!
    end

    respond_to do |format|
      format.json { render :status, status: :ok }
    end
  end

  def watchdog_status
    @client.raw_watchdog_version = params[:version]
    @client.has_watchdog = true
    if params[:version]
      # Check client Version Id
      wv_ids = WatchdogVersion.where(version: params[:version]).pluck(:id)
      if wv_ids.length > 0
        @client.watchdog_version_id = wv_ids[0]
      end

    end
    @client.save
    respond_to do |format|
      format.json { render :watchdog_status, status: :ok }
    end
  end

  # POST /clients or /clients.json
  def create
    @client = Client.new
    @client.user = current_user
    @secret = SecretsHelper.create_human_readable_secret(11)
    @client.secret = @secret
    ug = UpdateGroup.default_group
    if !ug.nil?
      @client.update_group = ug
    end

    # If it's registered with a superaccount token
    # set the pod as having a watchdog (physical pod)
    if @account&.superaccount?
      @client.has_watchdog = true

    end

    respond_to do |format|
      if @client.save
        clients = policy_scope(Client)
        format.turbo_stream {
          render turbo_stream: turbo.stream.replace('clients_container_dynamic', partial: 'clients_list', locals: { clients: clients })
        }
        format.html { redirect_to clients_path, notice: "Client was successfully created." }
        format.json { render :show, status: :created, location: client_path(@client.unix_user) }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @client.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /clients/1 or /clients/1.json
  def update
    name = params[:client][:name]
    account_id = params[:account_id]
    location_id = params[:location_id]

    # not doing policy_scope because when selecting another account
    # different to current_account, running policy_scope(Client) would throw
    client = Client.find_by_unix_user(params[:id])

    # defaulting to current_account. UI does not
    # allow account to be empty anyways
    if current_account.is_all_accounts?
      account = client.account
    else
      account = current_account
    end

    location = nil
    if account_id
      account = policy_scope(Account).find(account_id) if account_id != current_account.id
      if location_id
        # not doing policy_scope as that would check with current_account and the new location
        # could not be in the current_account's locations list
        location = Location.where(id: location_id, account_id: account_id).first
      end
    else
      location = policy_scope(Location).find(location_id) if location_id
      account = location.account if location
    end
    if params[:update_group_id]
      update_group = policy_scope(UpdateGroup).find(params[:update_group_id])
    else
      update_group = client.update_group
    end
    respond_to do |format|
      if client.update(name: name, location: location, account: account, update_group: update_group)
        if FeatureFlagHelper.is_available('networks', current_user)
          format.html { redirect_back fallback_location: root_path, notice: "Client was successfully updated." }
        else
          format.html { redirect_to clients_path, notice: "Client was successfully updated.", status: :see_other }
        end
        
        format.json { render :show, status: :ok, location: client_path(client.unix_user) }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: client.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /clients/1 or /clients/1.json
  def destroy
    @client.destroy

    # Check if there is a reference to the client in the recents list to delete
    possible_recent_search = policy_scope(RecentSearch).find_by_client_id(@client.id)
    possible_recent_search.destroy if possible_recent_search.present?

    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: "Client was successfully deleted." }
      format.json { head :no_content }
    end
  end

  def update_in_use
    @client.in_use = params[:in_use]
    if @client.save
      notice = "Client status was successfully updated."
    else
      notice = "Error updating client status."
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
      format.json { head :no_content }
    end
  end

  def toggle_in_service
    current_in_service_status = @client.in_service
    @client.in_service = !current_in_service_status
    if @client.save
      notice = "Client in service status was successfully updated."
    else
      notice = "Error updating client in service status."
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
      format.json { head :no_content }
    end
  end

  # GET /client/:unix_user/pdf_labels
  def get_client_label
    client_path = request.base_url + "/check/" + @client.unix_user
    qr = RQRCode::QRCode.new(client_path)

    qr_svg = qr.as_svg(
      color: "000",
      shape_rendering: "crispEdges",
      module_size: 1,
      standalone: true,
      use_path: true,
      viewbox: true
    )

    zoom = 203.0/300.0

    respond_to do |format|
      format.pdf do
        render pdf: "#{@client.unix_user}",
               page_width: "609px",
               page_height: "406px",
               template: "client_labels/show.html.erb",
               layout: "client_label.html",
               dpi: 203,
               zoom: zoom,
               page_offset: 0,
               locals: { qr: qr_svg },
               margin: { top: 0, bottom: 0, left: 0, right: 0 },
               outline: { outline: false }
      end
    end
  end

  def bulk_run_tests
    if @clients.update_all(test_requested: true)
      if FeatureFlagHelper.is_available('networks', current_user)
        @notice = "Pod speed tests successfully requested."
      else
        @notice = "Test was successfully requested for selected clients."
      end
    else
      @notice = "Error requesting test for selected clients."
    end

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: root_path, notice: @notice }
    end
  end

  def bulk_delete
    error = nil
    # Using a loop instead of update_all because update_all deletes the reference
    # to @clients after finishing the transaction, and the reference is needed to
    # update the view correctly and remove the deleted entities.
    begin
      Client.transaction do
        @clients.each do |c|
          c.update(user: nil, location: nil, account: nil)
        end
      end
    rescue Exception => e
      error = e.message
    end
    if error.nil?
      @notice = "Clients were successfully deleted."
      @clients.each do |c|
        remove_recent_search(c.id, Recents::RecentTypes::CLIENT)
      end
    else
      @notice = "Oops! There has been an error deleting your clients."
    end

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: root_path, notice: @notice }
    end
  end

  def get_bulk_change_release_group
  end

  def bulk_update_release_group
    update_group_id = params[:update_group_id].to_i
    if @clients.update_all(update_group_id: update_group_id)
      @notice = "Clients' release group was successfully updated."
    else
      @notice = "Oops! There has been an error updating your clients' release group."
    end
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: root_path, notice: @notice }
    end
  end

  def bulk_pdf_labels
    client_ids = params[:ids].split(',')
    @clients = policy_scope(Client).where(unix_user: client_ids)
    @qrs = []
    @clients.each do |client|
      client_path = request.base_url + "/check/" + client.unix_user
      qr = RQRCode::QRCode.new(client_path)
      qr_svg = qr.as_svg(
        color: "000",
        shape_rendering: "crispEdges",
        module_size: 1,
        standalone: true,
        use_path: true,
        viewbox: true
      )
      @qrs.append(qr_svg)
    end

    zoom = 203.0/300.0

    respond_to do |format|
      format.pdf do
        render pdf: "Pod Labels",
               page_width: "609px",
               page_height: "406px",
               template: "client_labels/bulk_show.html.erb",
               layout: "client_label.html",
               dpi: 203,
               zoom: zoom,
               page_offset: 0,
               locals: { qrs: @qrs },
               margin: { top: 0, bottom: 0, left: 0, right: 0 },
               outline: { outline: false }
      end
    end
  end

  def unclaimed
    if !current_account.superaccount
      head(403)
    end
    @clients = Client.where_no_account.where_online
  end

  def get_bulk_remove_from_network
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def bulk_remove_from_network
    @pods_to_remove_ids = @clients.map(&:unix_user)
    @error = nil
    Client.transaction do
      @clients.each do |pod|
        pod.update(location_id: nil)
      end
    rescue Exception => e
      @error = "Oops! There has been an error removing pod(s) from their network(s)."
    end
    respond_to do |format|
      if @error.nil?
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: @error, status: :unprocessable_entity }
      end
    end
  end

  def get_bulk_move_to_network
    @location = policy_scope(Location).find(params[:current_network_id]) if params[:current_network_id].to_i != -1
  end

  def bulk_move_to_network
    current_network_id = !params[:current_network_id].blank? ? params[:current_network_id] : nil
    @location = policy_scope(Location).find(params[:current_network_id]) if current_network_id
    new_location = policy_scope(Location).find(params[:location_id])
    if @location.present? && @location.id != new_location.id
      @clients_to_remove = @clients
    end
    @error = nil
    Client.transaction do
      @clients.each do |pod|
        pod.update(location_id: new_location.id, account_id: new_location.account&.id)
      end
    rescue Exception => e
      @error = "Oops! There has been an error removing pod(s) from their network(s)."
    end
    respond_to do |format|
      if @error.nil?
        @notice = "Your pods have been moved to #{new_location.name}."
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: @error, status: :unprocessable_entity }
      end
    end
  end

  def speed_average
    start_date = get_range_start_date(params[:type])
    end_date = Time.zone.now
    filtered_measurements = @client.measurements.where(created_at: start_date..end_date)
    if filtered_measurements.count > 0
      download_avg = filtered_measurements.average(:download).round(3)
      upload_avg = filtered_measurements.average(:upload).round(3)
    else
      download_avg = nil
      upload_avg = nil
    end

    respond_to do |format|
      format.html {
        render partial: "pods/components/speed_cells",
        locals: {
          download_avg: download_avg.present? ? "#{download_avg.round(2)} Mbps" : 'N/A',
          upload_avg: upload_avg.present? ? "#{upload_avg.round(2)} Mbps" : 'N/A',
        }
    }
    end
  end

  def get_add_pod_modal
    @unix_user = params[:unix_user]
  end

  def check_claim_new_pod
    # Not using set_client as we don't want to throw here
    @unix_user = params[:pod_id]
    @client = Client.find_by_unix_user(@unix_user)
    @error = nil
    if FeatureFlagHelper.is_available('networks', current_user) && params[:onboarding].present?
      @onboarding = true
      @network = policy_scope(Location).last
    end
    if !@client
      @error = ErrorsHelper::PodClaimErrors::PodNotFound
    elsif @client.user.present?
      @error = ErrorsHelper::PodClaimErrors::PodAlreadyClaimed
    else
      @location = Location.new
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def claim_new_pod
    pod_assignment_type = params[:network_assignment_type]
    @client = Client.find_by_unix_user(params[:id])
    raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:id]}", Client.name, params[:id]) unless @client.present?
    account = params[:account_id].present? ? policy_scope(Account).find(params[:account_id]) : current_account
    @client.user = current_user
    @client.account = account
    if pod_assignment_type == 'no_network'
      @client.location = nil
    elsif pod_assignment_type == 'existing_network'
      @client.location = policy_scope(Location).find(params[:network_id])
    elsif pod_assignment_type == 'new_network'
      @location = Location.new(location_params)
      @location.user = current_user
      @location.account_id = account.id
      @location.clients << @client
      @location.categories << policy_scope(Category).where(id: params[:categories].split(",")).distinct if params[:categories].present?
      @location.save!
      @client.location = @location
    end
    if FeatureFlagHelper.is_available('networks', current_user)
      @onboarding = params[:onboarding].present?
      @locations = policy_scope(Location)
    end
    respond_to do |format|
      if @client.save!
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: "Oops! There has been an error adding your new pod. Please try again later." }
      end
    end
  end

  def get_bulk_move_to_account
    possible_pod_ids = params[:pod_ids].present? ? JSON.parse(params[:pod_ids]) : nil
    @pods = Client.none
    if possible_pod_ids.present?
      @pods = policy_scope(Client).where(unix_user: possible_pod_ids)
    end

    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def bulk_move_to_account
    account_id = params[:account_id]
    account = policy_scope(Account).find(account_id)
    pod_ids = params[:pod_ids].present? ? JSON.parse(params[:pod_ids][0]) : nil
    @error = nil
    @pods = Client.none
    @pod_ids = []
    if pod_ids.present?
      @pods = policy_scope(Client).where(unix_user: pod_ids)
      @pod_ids = @pods.map(&:id)
    end
    Client.transaction do
      @pods.each do |pod|
        pod.update(account_id: account_id, location_id: nil)
      end
    rescue Exception => e
      @error = "Oops! There has been an error moving pod(s) to their account."
    end
    respond_to do |format|
      if @error.nil?
        @notice = "Your pods have been moved to #{account.name}."
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: "Oops! There has been an error moving pod(s) to their account.", status: :unprocessable_entity }
      end
    end
  end

  def get_bulk_move_to_network_qr
    possible_pod_ids = params[:pod_ids].present? ? JSON.parse(params[:pod_ids]) : nil
    @pods = Client.none
    if possible_pod_ids.present?
      @pods = policy_scope(Client).where(unix_user: possible_pod_ids)
    end

    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def bulk_move_to_network_qr
    network_id = params[:network_id]
    network = policy_scope(Location).find(network_id)
    pod_ids = params[:pod_ids].present? ? JSON.parse(params[:pod_ids][0]) : nil
    @error = nil
    @pods = Client.none
    @clients = Client.none
    if pod_ids.present?
      @pods = policy_scope(Client).where(unix_user: pod_ids)
      @clients = @pods
    end
    Client.transaction do
      @pods.each do |pod|
        pod.update(location_id: network_id, account_id: network.account.id)
      end
    rescue Exception => e
      @error = "Oops! There has been an error moving pod(s) to their network."
    end
    respond_to do |format|
      if @error.nil?
        @notice = "Your pods have been moved to #{network.name}."
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: "Oops! There has been an error moving pod(s) to their network.", status: :unprocessable_entity }
      end
    end
  end

  def bulk_move_pods_to_account_step_one
    pod_ids = JSON.parse(params[:pod_ids][0])
    @pods = policy_scope(Client).where(unix_user: pod_ids)
  end

  def go_back_bulk_move_pods_to_account
    pod_ids = params[:pod_ids]
    @pods = policy_scope(Client).where(unix_user: pod_ids)
  end

  def bulk_move_pods_to_network_step_one
    pod_ids = JSON.parse(params[:pod_ids][0])
    @pods = policy_scope(Client).where(unix_user: pod_ids)
  end

  def go_back_bulk_move_pods_to_network
    pod_ids = params[:pod_ids]
    @pods = policy_scope(Client).where(unix_user: pod_ids)
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_client
    @client = Client.find_by_unix_user(params[:id])
    if !@client
      raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:id]}", Client.name, params[:id])
    end
    authorize @client, :superaccount_or_in_scope?
  end

  # Only allow a list of trusted parameters through.
  def client_params
    params.require(:client).permit(:name, :address, :location_id)
  end

  def location_params
    params.require(:location).permit(:name, :address, :expected_mbps_up, :expected_mbps_down, :latitude, :longitude, :manual_lat_long, :automatic_location, :account_id)
  end

  def authenticate_client!
    @client = Client.find_by_unix_user(params[:id])&.authenticate_secret(params[:secret])
    if !@client
      head(403)
    end
  end

  def authenticate_token!
    if request.headers["Authorization"].present?
      token = request.headers["Authorization"].split(" ")
      if token.size == 2 && token[0] == 'Token'
        @account = Account.find_by_token(token[1])
      end
    end
  end

  def json_request?
    request.format.symbol == :json
  end

  def set_clients
    client_ids = JSON.parse(params[:ids])
    @clients = policy_scope(Client).where(unix_user: client_ids)
  end

  def check_request_origin
    is_from_search = params[:origin].present? && params[:origin] == 'search'
    return if !is_from_search
    store_recent_search(params[:id], Recents::RecentTypes::CLIENT)
  end
end
