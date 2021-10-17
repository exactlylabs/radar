class MeasurementsController < ApplicationController
  before_action :set_client
  before_action :set_measurement, only: %i[ show edit update destroy ]

  # GET /measurements or /measurements.json
  def index
    @measurements = @client.measurements
  end

  # GET /measurements/1 or /measurements/1.json
  def show
  end

  # GET /measurements/new
  def new
    @measurement = @client.measurements.build
  end

  # GET /measurements/1/edit
  def edit
  end

  # POST /measurements or /measurements.json
  def create
    @measurement = @client.measurements.build(measurement_params)

    respond_to do |format|
      if @measurement.save
        format.html { redirect_to client_measurements_path(@client), notice: "Measurement was successfully created." }
        format.json { render :show, status: :created, location: @measurement }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @measurement.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /measurements/1 or /measurements/1.json
  def update
    respond_to do |format|
      if @measurement.update(measurement_params)
        format.html { redirect_to client_measurement_path(@client), notice: "Measurement was successfully updated." }
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
      format.html { redirect_to client_measurements_path(@client), notice: "Measurement was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_measurement
      @measurement = @client.measurements.find(params[:id])
    end

    def set_client
      @client = Client.find(params[:client_id])
    end

    # Only allow a list of trusted parameters through.
    def measurement_params
      params.require(:measurement).permit(:style, :result, :client_id)
    end
end
