require "csv"

class MeasurementsController < ApplicationController
  before_action :authenticate_user!, except: %i[ new create ]
  before_action :set_client
  before_action :set_measurement, only: %i[ show edit update destroy ]
  skip_forgery_protection only: %i[ create ]

  # GET /measurements or /measurements.json
  def index
    @measurements = @client.measurements

    respond_to do |format|
      format.html
      format.csv { send_data @measurements.to_csv, filename: "measurements-#{@client.unix_user}.csv" }
    end
  end

  def ndt7_index
    respond_to do |format|
      format.csv { send_data @client.measurements.where(style: "NDT7").to_ndt7_csv, filename: "measurements-extended-#{@client.unix_user}.csv" }
    end
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

  # EG curl 'http://localhost:3000/clients/rXwPeMerHymM/measurements' \
  #       -H 'Accept: application/json' \
  #       -F "measurement[style]=hello" -F "client_secret=cGy0DDnDbN5" -F 'measurement[result]=@/Users/untoldone/Desktop/download.jpeg'
  # POST /measurements or /measurements.json
  def create
    if !user_signed_in? && !client_signed_in?
      head(403)
      return
    end

    @measurement = @client.measurements.build(measurement_params)

    respond_to do |format|
      if @measurement.save
        ProcessMeasurementJob.perform_later @measurement

        format.html { redirect_to client_measurements_path(@client.unix_user), notice: "Measurement was successfully created." }
        format.json { render :show, status: :created, location: client_measurement_path(@client.unix_user, @measurement) }
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
        format.html { redirect_to client_measurement_path(@client.unix_user, @measurement), notice: "Measurement was successfully updated." }
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
      if user_signed_in?
        @client = current_user.clients.find_by_unix_user(params[:client_id])
      else
        client = Client.find_by_unix_user(params[:client_id])
        if client.authenticate_secret(params[:client_secret])
          @client = client
        end
      end
    end

    # Only allow a list of trusted parameters through.
    def measurement_params
      params.require(:measurement).permit(:style, :result, :client_id)
    end

    def client_signed_in?
      Client.find_by_unix_user(params[:client_id])&.authenticate_secret(params[:client_secret]) != false
    end
end
