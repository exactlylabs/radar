class LocationsController < ApplicationController
  include Recents
  include Paginator
  include RangeEvaluator
  before_action :authenticate_user!
  before_action :check_account_presence, only: %i[ index show ]
  before_action :check_request_origin, only: %i[ show ]
  before_action :set_location, only: %i[ edit update destroy request_test speed_average ]
  before_action :set_location_and_account_if_needed, only: %i[ show ]
  before_action :set_locations, only: %i[ bulk_destroy move_to_account bulk_move_to_account ]

  # GET /locations or /locations.json
  def index
    category_id = params[:category]
    account_id = params[:account_id]
    @locations = policy_scope(Location)
    if category_id
      @locations = @locations.joins(:categories_locations).where(categories_locations: {category_id: category_id})
    end
    if account_id && account_id.to_i != -1
      @locations = @locations.where(account_id: account_id)
    end
    if params[:status].present? && params[:status] != 'all'
      status_filter = params[:status] == 'online'
      @locations = @locations.where(online: status_filter)
    end
    @total = @locations.count
    sort_by = params[:sort_by] || 'name'
    sort_order = params[:sort_order] || 'asc'
    @locations = @locations.order(sort_by => sort_order)
    @locations = paginate(@locations, params[:page], params[:page_size])
    @menu_id = params[:menu_id] if params[:menu_id].present?
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  # GET /locations/1 or /locations/1.json
  def show
  end

  # GET /locations/new
  def new
    @location = Location.new
    if FeatureFlagHelper.is_available('networks', current_user)
      respond_to do |format|
        format.html
        format.turbo_stream { render turbo_stream: turbo_stream.update('new_location_modal', partial: "locations/new", locals: { location: @location }) }
      end
    end
  end

  def new_network_onboarding
    @location = Location.new
    if FeatureFlagHelper.is_available('networks', current_user)
      respond_to do |format|
        format.html
        format.turbo_stream
      end
    end
  end

  # GET /locations/1/edit
  def edit
    if FeatureFlagHelper.is_available('networks', current_user)
      respond_to do |format|
        format.html
        format.turbo_stream { render turbo_stream: turbo_stream.update('edit_location_modal', partial: "locations/new", locals: { location: @location }) }
      end
    end
  end

  # POST /locations or /locations.json
  def create
    @location = Location.new(location_params)
    @location.user = current_user
    @location.account_id = current_account.is_all_accounts? ? params[:location][:account_id] : current_account.id

    @is_onboarding = params[:onboarding] == "true"

    respond_to do |format|
      if @location.save
        @location.categories << policy_scope(Category).where(id: params[:categories].split(",")).distinct if params[:categories].present?
        format.turbo_stream
        format.html { redirect_to locations_path, notice: "Location was successfully created." }
        format.json { render :show, status: :created, location: @location }
      else
        @error = true
        format.turbo_stream
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @location.errors, status: :unprocessable_entity }
      end
    end
  end

  def request_test
    @location.test_requested = true
    @location.save
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: "Test was requested successfully on location." }
    end
  end

  # PATCH/PUT /locations/1 or /locations/1.json
  def update
    respond_to do |format|
      # By getting the specific locations that get added/deleted
      # we can emit the exact events for each location
      current_categories_ids = @location.categories.map {|c| c.id}
      if params[:categories].present?
        latest_categories_ids = params[:categories].split(",").map {|id| id.to_i}
      else
        latest_categories_ids = []
      end

      new_categories_ids = latest_categories_ids - current_categories_ids
      to_delete_categories_ids = current_categories_ids - latest_categories_ids

      to_delete_categories_ids.each do |id|
        @location.categories.delete(id) # This delete method does trigger callbacks
      end
      @location.categories << policy_scope(Category).where(id: new_categories_ids)
      if @location.save && @location.update(location_params)
        @locations = policy_scope(Location)
        if FeatureFlagHelper.is_available('networks', current_user)
          @total = @locations.count
          @locations = paginate(@locations, params[:page], params[:page_size])
        end
        format.turbo_stream
        format.html { redirect_to locations_path, notice: "Location was successfully updated." }
        format.json { render :show, status: :ok, location: @location }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @location.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /locations/1 or /locations/1.json
  def destroy
    begin
      @location.soft_delete
    rescue Exception => e
      handle_exception(e, current_user)
      @notice = "Error deleting network."
    end
    @notice = FeatureFlagHelper.is_available('networks', current_user) ? "Network was successfully deleted." : "Location was successfully deleted." if !@notice
    respond_to do |format|
      format.html { redirect_to locations_url, notice: @notice }
      format.json { head :no_content }
    end
  end

  # Method called by edit pod modal to retrieve locations
  # associated to selected account from select dropdown
  def get_by_account_id
    account_id = params[:account_id]
    account = policy_scope(Account).find(account_id)
    respond_to do |format|
      if account
        locations = account.locations.map { |location| { id: location.id, text: location.name } }
        format.json { render json: locations, status: :ok }
      else
        format.json { render json: [], status: :not_found }
      end
    end
  end

  def bulk_destroy
    error = nil
    @deleted_networks_ids = []
    Location.transaction do
      @locations.each do |location|
        @deleted_networks_ids << location.id
        location.soft_delete
      end
    rescue Exception => e
      error = e.message
    end

    if !error
      @notice = "Networks were successfully deleted."
    else
      @notice = "Error deleting networks."
    end

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: root_path, notice: @notice }
    end
  end

  def move_to_account
    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def bulk_move_to_account
    error = false
    @locations_to_move_ids = @locations.map(&:id)
    Location.transaction do
      account_id = params[:account_id]
      account = policy_scope(Account).find(account_id)
      wants_to_move_tests = params[:wants_to_move_tests] == "true"
      @locations.each do |location|
        old_account = location.account
        location.update(account_id: account.id)
        if wants_to_move_tests
          location.record_event(
            Location::Events::DATA_MIGRATION_REQUESTED, {
              from: old_account.id,
              to: account.id
            },
            Time.now
          )
          MeasurementMigrationJob.perform_later(location, old_account, account)
        else
          # Not calling this after because in the case the user wants to move tests,
          # we need to recalculate after reassigning the account
          location.recalculate_averages!
        end
      end
    rescue Exception => e
      handle_exception(e, current_user)
      error = e.message
    end

    respond_to do |format|
      if !error
        @notice = "Networks were successfully moved."
        format.turbo_stream
        format.html
      else
        format.html { redirect_back fallback_location: root_path, notice: "Oops! There has been an error moving your network(s). Please try again later.", status: :unprocessable_entity }
      end
    end
  end

  def speed_average
    # Default to network's created at if type is empty (all time)
    start_date = get_range_start_date(params[:type]) || @location.created_at
    end_date = Time.zone.now
    filtered_measurements = @location.measurements.where(created_at: start_date..end_date)
    if filtered_measurements.count > 0
      @download_avg = filtered_measurements.average(:download).to_f.round(2)
      @upload_avg = filtered_measurements.average(:upload).to_f.round(2)
    else
      @download_avg = nil
      @upload_avg = nil
    end

    @download_diff = @location.download_diff(@download_avg || -1)
    @upload_diff = @location.upload_diff(@upload_avg || -1)

    respond_to do |format|
      format.turbo_stream
    end
  end

  private

    # We want to allow for a user to access a network if it's within reach of all their accessible accounts,
    # regardless of the current one not being the network's one. So we need to change the current account to
    # the network's one if needed
    def set_location_and_account_if_needed
      @location = policy_scope(Location).find_by_id(params[:id]) # Don't want to throw on first check
      return if @location.present?

      @location = Location.find(params[:id]) # This is the actual throwable check
      return if current_user.super_user && !is_super_user_disabled? && current_account.is_all_accounts?

      has_access_to_network_account = policy_scope(Account).where(id: @location.account_id).exists?
      raise ActiveRecord::RecordNotFound.new("Couldn't find Network with 'id'=#{params[:id]}", Location.name, params[:id]) unless has_access_to_network_account

      set_new_account(@location.account) if current_account.id != @location.account_id
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_location
      @location = policy_scope(Location).find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def location_params
      params.require(:location).permit(:name, :address, :expected_mbps_up, :expected_mbps_down, :latitude, :longitude, :manual_lat_long, :automatic_location, :account_id)
    end

    def check_request_origin
      is_from_search = params[:origin].present? && params[:origin] == 'search'
      return if !is_from_search
      store_recent_search(params[:id], Recents::RecentTypes::LOCATION)
    end

    def set_locations
      location_ids = JSON.parse(params[:ids])
      @locations = policy_scope(Location).where(id: location_ids)
    end
end
