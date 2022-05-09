class LocationMeasurementsController < ApplicationController
  include Pagination
  before_action :authenticate_user!
  before_action :set_location
  skip_forgery_protection only: %i[ create ]

  # GET /measurements or /measurements.json
  def index
    @measurements = @location.measurements.order(created_at: :desc).then(&paginate)
    @total = @location.measurements.length
    puts @total
    respond_to do |format|
      format.html { render "index", locals: { measurements: @measurements, total: @total } }
      format.csv { send_data @measurements.to_csv, filename: "measurements-#{@location.id}.csv" }
    end
  end

  def ndt7_index
    respond_to do |format|
      format.csv { send_data @location.measurements.where(style: "NDT7").to_ndt7_csv, filename: "measurements-extended-#{@location.id}.csv" }
    end
  end

  private
    def set_location
      @location = current_user.locations.find(params[:location_id])
    end
end
