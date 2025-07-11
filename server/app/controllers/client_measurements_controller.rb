class ClientMeasurementsController < ApplicationController
  include Paginator
  include RangeEvaluator
  before_action :authenticate_user!, except: %i[ create ]
  before_action :check_account_presence, only: %i[ index show ndt7_index ]
  before_action :set_client
  before_action :set_measurement, only: [:show]
  skip_forgery_protection only: %i[ create ]

  # GET /measurements or /measurements.json
  def index
    @measurements = policy_scope(@client.measurements) # Don't bring in measurements made on another account different to the current one
    if @client.account.present?
      @measurements = @measurements.where(account: @client.account)
    end
    @measurements = @measurements.where(style: params[:style].upcase) if params[:style].present?
    if params[:range].present?
      range = human_filter_to_range(params[:range])
      @measurements = @measurements.where(created_at: range[0]..range[1])
    end
    @measurements = @measurements.where(wireless: params[:connection].upcase == 'WIFI') if params[:connection].present?

    if params[:sort_by].present?
      sort_by = params[:sort_by]
      order = params[:order] || 'desc'
      @measurements = @measurements.order(sort_by => order)
    else
      @measurements = @measurements.order(created_at: :desc)
    end

    @total = @measurements.count
    @measurements = paginate(@measurements, params[:page], params[:page_size]) unless request.format.csv?

    respond_to do |format|
      format.html { render "index", locals: { measurements: @measurements } }
      format.csv { send_data Measurement.to_csv(@measurements), filename: "measurements-#{@client.unix_user}.csv" }
    end
  end

  def show
  end

  def ndt7_index
    respond_to do |format|
      format.csv { send_data Measurement.to_ndt7_csv(@client.measurements.where(style: "NDT7")), filename: "measurements-extended-#{@client.unix_user}.csv" }
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
    allowed_params = measurement_params

    # Compress the result file before attaching it to the measurement
    gzipped_file = Tempfile.new(encoding: 'ascii-8bit')
    gzipped_file.write(ActiveSupport::Gzip.compress(allowed_params[:result].tempfile.read))
    gzipped_file.rewind
    allowed_params[:result].tempfile = gzipped_file
    allowed_params.merge!(gzip: true)
    @measurement = @client.measurements.build(allowed_params)
    @measurement.client_version = @client.raw_version
    @measurement.client_distribution = @client.distribution_name
    @measurement.network_interfaces = @client.network_interfaces
    @measurement.account = @client.account if @client.account.present?
    @measurement.location = @client.location if @client.location.present?
    @measurement.lonlat = @client.location.lonlat if @client.location.present?
    @measurement.ip = request.ip

    if params[:connection_info].present? && params[:measurement][:wireless] == "true"
      conn_info = params[:connection_info]
      if conn_info.is_a?(String)
        conn_info = JSON.parse conn_info
      end
      @measurement.signal = conn_info["signal"]
      @measurement.tx_speed = conn_info["tx_speed"]
      @measurement.frequency = conn_info["frequency"]
      @measurement.channel = conn_info["channel"]
      @measurement.width = conn_info["width"]
      @measurement.noise = conn_info["noise"]
    end

    if @client.test_requested
      @client.location&.schedule_next_test!
      @client.schedule_next_test!
      @client.test_requested = false
      @client.save!
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
      @client = policy_scope(Client).find_by_unix_user(params[:client_id])
    else
      client = Client.find_by_unix_user(params[:client_id])
      if client.authenticate_secret(params[:client_secret])
        @client = client
      end
    end
    if !@client
      raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:client_id]}", Client.name, params[:client_id])
    end
  end

  # Only allow a list of trusted parameters through.
  def measurement_params
    params.require(:measurement).permit(:style, :result, :interface, :wireless, :client_id)
  end

  def client_signed_in?
    Client.find_by_unix_user(params[:client_id])&.authenticate_secret(params[:client_secret]) != false
  end

  def set_measurement
    @measurement = @client.measurements.find(params[:id])

    if @measurement
      @longitude = @client.longitude
      @latitude = @client.latitude
    else
      raise ActiveRecord::RecordNotFound.new("Couldn't find Measurement with 'id'=#{params[:id]}", Measurement.name, params[:id])
    end
  end
end
