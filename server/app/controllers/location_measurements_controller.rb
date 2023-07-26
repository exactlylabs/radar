class LocationMeasurementsController < ApplicationController
  include Paginator
  before_action :authenticate_user!
  before_action :check_account_presence, only: %i[ index ndt7_index ]
  before_action :set_location
  skip_forgery_protection only: %i[ create ]

  # GET /measurements or /measurements.json
  def index
    @measurements = @location.measurements.where(account_id: @location.account_id).order(created_at: :desc) # only show measurements tied with current location's account
    
    if FeatureFlagHelper.is_available('networks' , current_user)
      @measurements = @measurements.where(style: params[:style].upcase) if params[:style].present? && params[:style].upcase != 'ALL'
      if params[:range].present?
        range = get_date_range(params[:range])
        @measurements = @measurements.where(created_at: range[0]..range[1])
      end
      @total = @measurements.count
      @measurements = paginate(@measurements, params[:page], params[:page_size])
    end
    
    respond_to do |format|
      format.html { render "index", locals: { measurements: @measurements } }
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
      @location = policy_scope(Location).find(params[:location_id])
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
        [nil, Time.now]
      end
    end
end
