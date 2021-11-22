class LocationMeasurementsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_location
  before_action :set_measurement, only: %i[ show edit update destroy ]
  skip_forgery_protection only: %i[ create ]

  # GET /measurements or /measurements.json
  def index
    @measurements = @location.measurements

    respond_to do |format|
      format.html
      format.csv { send_data @measurements.to_csv, filename: "measurements-#{@location.unix_user}.csv" }
    end
  end

  def ndt7_index
    respond_to do |format|
      format.csv { send_data @location.measurements.where(style: "NDT7").to_ndt7_csv, filename: "measurements-extended-#{@location.id}.csv" }
    end
  end

  # GET /measurements/1 or /measurements/1.json
  def show
  end

  # GET /measurements/1/edit
  def edit
  end

  # PATCH/PUT /measurements/1 or /measurements/1.json
  def update
    respond_to do |format|
      if @measurement.update(measurement_params)
        format.html { redirect_to location_measurement_path(@location, @measurement), notice: "Measurement was successfully updated." }
        format.json { render :show, status: :ok, location: @measurement }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @measurement.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /measurements/1 or /measurements/1.json
  def destroy
    @measurement.destroy
    respond_to do |format|
      format.html { redirect_to location_measurements_path(@location), notice: "Measurement was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_measurement
      @measurement = @location.measurements.find(params[:id])
    end

    def set_location
      @location = current_user.locations.find(params[:location_id])
    end

    # Only allow a list of trusted parameters through.
    def measurement_params
      params.require(:measurement).permit(:style, :result, :location_id)
    end
end
