require "sshkey"
require "rqrcode"

class ClientsController < ApplicationController
  include Recents
  include Paginator
  include ErrorsHelper
  include RangeEvaluator
  before_action :check_account_presence, only: %i[ index show ]
  before_action :authenticate_user!, except: %i[ configuration new create status watchdog_status public_status check_public_status run_test run_public_test crl ]
  before_action :authenticate_client!, only: %i[ configuration status watchdog_status ], if: :json_request?
  before_action :check_request_origin, only: %i[ show ]
  before_action :set_client, only: %i[ release update edit destroy get_client_label toggle_in_service speed_average remove_from_network claim_new_pod ]
  before_action :authenticate_token!, only: %i[ create status watchdog_status ]
  before_action :set_clients, only: %i[ bulk_run_tests bulk_delete bulk_update_release_group get_bulk_change_release_group get_bulk_remove_from_network bulk_remove_from_network get_bulk_move_to_network bulk_move_to_network ]
  before_action :set_client_and_change_account_if_needed, only: :show
  skip_forgery_protection only: %i[ status watchdog_status configuration new create ]

  # GET /clients or /clients.json
  def index
    @status = params[:status]
    @account_id = params[:account_id] || current_account.id
    @clients = policy_scope(Client)

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
      @clients = @clients.order("location_id NULLS FIRST")
      @clients = paginate(@clients, params[:page], params[:page_size])
    end
  end

  # GET /clients/1 or /clients/1.json
  def show
    account_id = current_account.id == -1 ? nil : current_account.id
    start_date = get_range_start_date
    download_and_upload_averages(@client, start_date)
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
    @location = @client.location
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
        format.json { render json: { msg: 'Client not found!' }, status: :not_found }
      elsif @client.user.present?
        format.json { render json: { msg: 'Client already claimed!' }, status: :bad_request }
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

    if location.present? && @account.present? && location.account != @account
      @error = true
    end

    @client = Client.find_by_unix_user(@client_id)
    respond_to do |format|
      if !@error && @client && !@client.user
        @client.user = current_user
        @client.location = location
        @client.name = @client_name
        @client.account = @account
        @client.save
        format.turbo_stream
        format.json { render :show, status: :ok, location: client_path(@client.unix_user) }
      elsif @error == true
        format.html { render :claim_form, status: :bad_request }
        format.json { render json: {}, status: :bad_request }
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
      if @client.release!
        remove_recent_search(@client.id, Recents::RecentTypes::CLIENT)
        notice = "Pod was successfully deleted."
        if request.referrer.include?(client_path(@client.unix_user))
          format.turbo_stream { redirect_to clients_path, notice: notice }
          format.html { redirect_to clients_path, notice: notice }
        else
          format.turbo_stream { }
          format.html { redirect_back fallback_location: root_path, notice: notice }
        end
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
    @client.record_event(Client::Events::SERVICE_STARTED, {}, Time.now) if params[:service_first_ping].present? && params[:service_first_ping] == "true"
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
    account = params[:account_id].present? ? policy_scope(Account).find(params[:account_id]) : current_account
    @client.account = account if account.present? && account.id != @client.account&.id
    begin
      assign_pod_to_network(account, params[:network_id], params[:network_assignment_type], params[:categories])
    rescue => e
      @notice = e
    end

    if !@notice && params[:update_group_id]
      update_group = policy_scope(UpdateGroup).find(params[:update_group_id])
      @client.update_group = update_group
    end

    respond_to do |format|
      if !@notice && @client.save!
        set_new_account(@client.account) if @client.account != current_account && !current_account.is_all_accounts?
        format.html { redirect_back fallback_location: root_path, notice: "Pod was successfully updated." }
        format.json { render :show, status: :ok, location: client_path(@client.unix_user) }
      else
        flash[:alert] = @notice
        format.turbo_stream
        format.html { redirect_back fallback_location: root_path, status: :unprocessable_entity }
        format.json { render json: @client.errors, status: :unprocessable_entity }
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

    zoom = 203.0 / 300.0

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
          c.release!
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
      @notice = there_has_been_an_error('deleting your clients')
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
      @notice = there_has_been_an_error('updating your clients\' release group')
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

    zoom = 203.0 / 300.0

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
      @error = there_has_been_an_error('removing pod(s) from their network(s)')
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
      @error = there_has_been_an_error('removing pod(s) from their network(s)')
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
    start_date = get_range_start_date(params[:type]) || @client.created_at
    download_and_upload_averages(@client, start_date)
    respond_to do |format|
      format.turbo_stream
    end
  end

  def get_add_pod_modal
    pods_ids = params[:pods_ids]
    clients_ids = pods_ids&.split(',') || []
    @clients = Client.where(unix_user: clients_ids)

    @unix_user = params[:unix_user]
  end

  def check_claimed_pod
    @clients_count = params[:pods_count].present? ? params[:pods_count].to_i : 0
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
      if can_move_pod_to_current_account(@client)
        @error = ErrorsHelper::PodClaimErrors::PodBelongsToOneOfYourOtherAccounts
      else
        if @client.account == current_account
          @error = ErrorsHelper::PodClaimErrors::PodIsAlreadyInYourAccount
        else
          @error = ErrorsHelper::PodClaimErrors::PodAlreadyClaimedBySomeoneElse
        end
      end
    else
      @location = Location.new
      @clients_count += 1
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def remove_claimed_pod
    if params[:pod_id].present?
      @pod_removed_id = params[:pod_id]
      @clients_count = params[:pods_count].present? ? (params[:pods_count].to_i - 1) : 0
    else
      @clients_count = 0
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def move_claimed_pod
    @clients_count = params[:pods_count].present? ? params[:pods_count].to_i : 0
    # Not using set_client as we don't want to throw here
    @unix_user = params[:pod_id]
    @client = Client.find_by_unix_user(@unix_user)
    @clients_count += 1
  end

  def save_claimed_pods
    pods_ids = params[:pods_ids]
    @clients_ids = pods_ids.split(',') || []
    @onboarding = params[:onboarding].present? && params[:onboarding] == 'true'
  end

  def add_claimed_pods_to_account_and_network
    @onboarding = params[:onboarding].present? && params[:onboarding] == 'true'
    pods_ids = params[:pods_ids]
    @clients_ids = pods_ids.split(',') || []
    @destination_account = policy_scope(Account).find(params[:account_id])
    @network_assignment_type = params[:network_assignment_type]
    @destination_network_id = params[:network_id]
    @location_params = location_params
    @categories = params[:categories]

    @moving_pods_count = @clients_ids.length
    unless @moving_pods_count > 0
      add_pods_to_account_and_network
    end
  end

  def confirm_moving_claimed_pods_to_account_and_network
    @onboarding = params[:onboarding].present? && params[:onboarding] == 'true'
    pods_ids = params[:pods_ids]
    @clients_ids = pods_ids.split(',') || []
    @destination_account = policy_scope(Account).find(params[:account_id])
    @network_assignment_type = params[:network_assignment_type]
    @destination_network_id = params[:network_id]
    location_information = JSON.parse(params[:location].to_s)
    @location_params = ActionController::Parameters.new({ location: location_information })
                                                   .require(:location)
                                                   .permit(:name, :address, :expected_mbps_up, :expected_mbps_down, :latitude, :longitude, :manual_lat_long, :automatic_location, :account_id)
    @categories = params[:categories]
    add_pods_to_account_and_network
  end

  def claim_new_pod
    account = params[:account_id].present? ? policy_scope(Account).find(params[:account_id]) : current_account
    @client.account = account if account.present? && account.id != @client.account.id
    begin
      assign_pod_to_network(account, params[:location_id], params[:network_assignment_type], params[:categories])
    rescue => e
      error = e.message
    end
    if FeatureFlagHelper.is_available('networks', current_user)
      @onboarding = params[:onboarding].present?
      @locations = policy_scope(Location)
    end
    respond_to do |format|
      if !error && @client.save!
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: there_has_been_an_error('adding your new pod') }
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
      @error = there_has_been_an_error('moving pod(s) to their account')
    end
    respond_to do |format|
      if @error.nil?
        @notice = "Your pods have been moved to #{account.name}."
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: there_has_been_an_error('moving pod(s) to their account') }
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
      @error = there_has_been_an_error('moving pod(s) to their network')
    end
    respond_to do |format|
      if @error.nil?
        @notice = "Your pods have been moved to #{network.name}."
        format.turbo_stream
      else
        format.html { redirect_back fallback_location: root_path, notice: there_has_been_an_error('moving pod(s) to their network'), status: :unprocessable_entity }
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

  def need_help_finding_pod_id
  end

  def remove_from_network
    begin
      @error = false
      @client.update(location_id: nil)
      @notice = 'Client was successfully removed from network.'
    rescue => _e
      @error = true
      @notice = there_has_been_an_error('removing your client from network')
    end

  end

  # GET /clients/crl -- Get Certificate Revocation List
  def crl
    send_file Rails.root.join("config", "rootCRL.crl.pem"), type: "application/x-pem-file", disposition: "inline"
  end

  private

  # We want to allow for a user to access a pod if it's within reach of all their accessible accounts,
  # regardless of the current one not being the pod's one. So we need to change the current account to the pod's one
  # if needed
  def set_client_and_change_account_if_needed
    @client = policy_scope(Client).find_by_unix_user(params[:id])
    raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:id]}", Client.name, params[:id]) unless @client.present?
    if @client.account_id.present?
      is_in_users_accounts = policy_scope(Account).where(id: @client.account_id).exists? # Not running find as we don't want to throw
      raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:id]}", Client.name, params[:id]) unless is_in_users_accounts

      return if current_user.super_user && !is_super_user_disabled? && current_account.is_all_accounts?

      set_new_account(@client.account) if !current_account.is_all_accounts? && current_account.id != @client.account_id
    end
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_client
    @client = policy_scope(Client).find_by_unix_user(params[:id])
    raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:id]}", Client.name, params[:id]) unless @client
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

  def assign_pod_to_network(account, network_id, pod_assignment_type, categories)
    @client.user = current_user if @client.user.nil?
    @previous_location = @client.location
    @location_params ||= location_params
    case pod_assignment_type
    when PodsHelper::PodAssignmentType::NoNetwork
      @client.location = nil
    when PodsHelper::PodAssignmentType::ExistingNetwork
      is_existing_network_in_current_account = policy_scope(Location).where(id: network_id).exists?

      # When changing an account, the network dropdown shows all networks for that account + empty option
      # so technically the network could be none, so we need to treat that case specifically
      if network_id.present?
        if is_existing_network_in_current_account
          existing_network = policy_scope(Location).find(network_id)
        else
          existing_network = Location.where(id: network_id, account_id: account.id).first
        end
        raise 'Invalid network assignment' if existing_network.nil?
        @client.account = existing_network.account if existing_network.account.id != @client.account.id
        @client.location = existing_network
      else
        @client.location = nil
        @client.account = account
      end
    when PodsHelper::PodAssignmentType::NewNetwork
      begin
        Client.transaction do
          @location = Location.new(@location_params)
          @location.user = current_user
          if account.present?
            @location.account = account
          else
            @location.account = @client.account
          end
          @location.save!
          if categories.present?
            now = Time.now
            network_categories = categories.split(",").map { |category_id| {
              category_id: category_id,
              location_id: @location.id,
              created_at: now,
              updated_at: now
            } }
            CategoriesLocation.insert_all(network_categories)
          end
          @client.location = @location
        end
      rescue ActiveRecord::RecordInvalid => e
        raise e.message
      rescue Exception => e
        handle_exception(e, current_user)
      end
    else
      raise 'Invalid network assignment type'
    end
    @client.save!
  end

  def can_move_pod_to_current_account(client)
    return false if client.account_id == current_account.id

    policy_scope(Account).where(id: client.account_id).count > 0
  end

  def add_pods_to_account_and_network
    @onboarding = params[:onboarding].present? && params[:onboarding] == 'true'
    @locations = policy_scope(Location)
    @clients = []
    begin
      Client.transaction do
        @clients_ids.each do |client_id|
          @client = Client.find_by_unix_user(client_id)
          @client.account = @destination_account
          assign_pod_to_network(@destination_account, @destination_network_id, @network_assignment_type, @categories)
          @clients.append(@client)
        end
      end
      @notice ||= @clients_ids.length > 1 ? "#{@clients_ids.length} pods have been successfully added" : "Your pod has been successfully added."
    rescue Exception => e
      Sentry.capture_exception(e)
      @notice ||= there_has_been_an_error('adding your new pod')
    end
  end

  def download_and_upload_averages(client, start_date)
    # Default to network's created at if type is empty (all time)
    end_date = Time.zone.now
    filtered_measurements = client.measurements.where(created_at: start_date..end_date)
    if filtered_measurements.count > 0
      @download_avg = filtered_measurements.average(:download).to_f.round(2)
      @upload_avg = filtered_measurements.average(:upload).to_f.round(2)
    else
      @download_avg = nil
      @upload_avg = nil
    end

    @download_diff = client.download_diff(@download_avg || -1)
    @upload_diff = client.download_diff(@upload_avg || -1)
  end
end
