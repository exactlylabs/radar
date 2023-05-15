class LocationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_location, only: %i[ show edit update destroy request_test ]

  # GET /locations or /locations.json
  def index
    category_id = params[:category]
    account_id = params[:account_id]
    @locations = policy_scope(Location)
    if category_id
      @locations = @locations.joins(:categories_locations).where(categories_locations: {category_id: category_id})
    end
    if account_id
      @locations = @locations.where(account_id: account_id)
    end
  end

  # GET /locations/1 or /locations/1.json
  def show
  end

  # GET /locations/new
  def new
    @location = Location.new
  end

  # GET /locations/1/edit
  def edit
  end

  # POST /locations or /locations.json
  def create
    @location = Location.new(location_params)

    @location.user = current_user
    @location.account_id = current_account.is_all_accounts? ? params[:location][:account_id] : current_account.id
    @location.categories << policy_scope(Category).where(id: params[:location][:categories].split(",")).distinct
    # TODO: Is there a better UX for this?
    current_clients = policy_scope(Client)
    if current_clients.count == 1
      @location.clients << current_clients.first
    end

    respond_to do |format|
      if @location.save
        format.turbo_stream
        format.html { redirect_to locations_path, notice: "Location was successfully created." }
        format.json { render :show, status: :created, location: @location }
      else
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
      if params[:location][:categories].present?
        # By getting the specific locations that get added/deleted
        # we can emit the exact events for each location
        current_categories_ids = @location.categories.map {|c| c.id}
        latest_categories_ids = params[:location][:categories].split(",").map {|id| id.to_i}
        
        new_categories_ids = latest_categories_ids - current_categories_ids
        to_delete_categories_ids = current_categories_ids - latest_categories_ids

        to_delete_categories_ids.each do |id|
          @location.categories.delete(id) # This delete method does trigger callbacks
        end
        @location.categories << policy_scope(Category).where(id: new_categories_ids)
      end
      if @location.save && @location.update(location_params)
        @locations = policy_scope(Location)
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
    @location.soft_delete
    policy_scope(CategoriesLocation).where(location_id: @location.id).destroy_all
    respond_to do |format|
      format.html { redirect_to locations_url, notice: "Location was successfully destroyed." }
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

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_location
      @location = policy_scope(Location).find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def location_params
      params.require(:location).permit(:name, :address, :expected_mbps_up, :expected_mbps_down, :latitude, :longitude, :manual_lat_long, :automatic_location, :account_id)
    end
end
