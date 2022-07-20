class LocationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_location, only: %i[ show edit update destroy request_test ]

  # GET /locations or /locations.json
  def index
    @locations = policy_scope(Location)
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
      if @location.update(location_params)
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
    @location.destroy
    respond_to do |format|
      locations = policy_scope(Location)
      format.turbo_stream { render turbo_stream: turbo_stream.replace('location_container_dynamic', partial: 'locations_list', locals: {locations: locations}) }
      format.turbo_stream { render turbo_stream: turbo_stream.remove(@location) }
      format.html { redirect_to locations_url, notice: "Location was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_location
      @location = policy_scope(Location).find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def location_params
      params.require(:location).permit(:name, :address, :expected_mbps_up, :expected_mbps_down, :latitude, :longitude, :manual_lat_long, :automatic_location)
    end
end
