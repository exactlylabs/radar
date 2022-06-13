class ClientMeasurementsController < ApplicationController
  before_action :authenticate_user!, except: %i[ create ]
  before_action :set_client
  skip_forgery_protection only: %i[ create ]

  # GET /measurements or /measurements.json
  def index
    @measurements = @client.measurements
    respond_to do |format|
      format.html { render "index", locals: { measurements: @measurements } }
      format.csv { send_data @measurements.to_csv, filename: "measurements-#{@client.unix_user}.csv" }
    end
  end

  def ndt7_index
    respond_to do |format|
      format.csv { send_data @client.measurements.where(style: "NDT7").to_ndt7_csv, filename: "measurements-extended-#{@client.unix_user}.csv" }
    end
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

    if !@client.location.nil?
      @measurement.location = @client.location
    end

    if !@client.user.nil?
      @measurement.user = @client.user
    end

    if @client.test_requested
      @client.test_requested = false
      @client.save
    end

    location = @client.location
    if location && location.test_requested
      location.test_requested = false
      location.save
    end

    respond_to do |format|
      if @measurement.save
        ProcessMeasurementJob.perform_later @measurement

        format.html { redirect_to client_measurements_path(@client.unix_user), notice: "Measurement was successfully created." }
        format.json { render :show, status: :created, location: client_measurements_path(@client.unix_user, @measurement) }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @measurement.errors, status: :unprocessable_entity }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_client
      if user_signed_in?
        @client = current_user.clients.find_by_unix_user(params[:client_id])
      else
        client = Client.find_by_unix_user(params[:client_id])
        if client.authenticate_secret(params[:client_secret])
          @client = client
        end
      end
      if !@client
        head(404)
        return
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
