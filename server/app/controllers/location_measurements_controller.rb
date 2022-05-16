class LocationMeasurementsController < ApplicationController
  include Pagination
  before_action :authenticate_user!
  before_action :set_location
  skip_forgery_protection only: %i[ create ]

  # GET /measurements or /measurements.json
  def index
    @style = params[:style]
    @range = get_date_range(params[:range])
    if @style.present? and @range.present?
      @measurements = @location.measurements.where(style: @style).where(created_at: @range[0]..@range[1]).order(created_at: :desc).then(&paginate)
    elsif @range.present?
      @measurements = @location.measurements.where(created_at: @range[0]..@range[1]).order(created_at: :desc).then(&paginate)
    elsif @style.present?
      @measurements = @location.measurements.where(style: @style).order(created_at: :desc).then(&paginate)
    else
      @measurements = @location.measurements.order(created_at: :desc).then(&paginate)
    end
    @total = @measurements.length
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

    def get_date_range(range)
      case range
      when 'last-week'
        [Time.now - 7.day, Time.now]
      when 'last-month'
        [Time.now - 30.day, Time.now]
      when 'last-six-months'
        [Time.now - 180.day, Time.now]
      when 'last-year'
        [Time.now - 365.day, Time.now]
      else
        [Date.today]
      end
    end
end
