class MeasurementsController < ApplicationController
  before_action :authenticate_user!

  def index
    @measurements = policy_scope(Measurement)
    authorize @measurements
    respond_to do |format|
      format.csv { send_data @measurements.to_csv, filename: "measurements.csv" }
    end
  end

  def full_index
    @measurements = Measurement.all
    authorize @measurements
    respond_to do |format|
      format.csv { send_data @measurements.to_csv, filename: "measurements.csv" }
    end
  end

  def full_ndt7_index
    @measurements = Measurement.where(style: "NDT7")
    authorize @measurements
    respond_to do |format|
      format.csv { send_data @measurements.to_ndt7_csv, filename: "measurements-extended.csv" }
    end
  end
end