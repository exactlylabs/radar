class MeasurementsController < ApplicationController
  before_action :authenticate_user!

  def index
    @measurements = current_user.measurements
    
    respond_to do |format|
      format.csv { send_data @measurements.to_csv, filename: "measurements.csv" }
    end
  end

  def full_index
    if !current_user.superuser
      render nothing: true, status: :unauthorized
    end

    respond_to do |format|
      format.csv { send_data Measurement.all.to_csv, filename: "measurements.csv" }
    end
  end

  def full_ndt7_index
    if !current_user.superuser
      render nothing: true, status: :unauthorized
    end


    @measurements = Measurement.where(style: "NDT7")

    respond_to do |format|
      format.csv { send_data @measurements.to_ndt7_csv, filename: "measurements-extended.csv" }
    end
  end
end