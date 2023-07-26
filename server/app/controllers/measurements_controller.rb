class MeasurementsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_measurement, only: [:show]

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
      format.csv do
        headers["X-Accel-Buffering"] = "no"
        headers["Cache-Control"] = "no-cache"
        headers["Content-Type"] = "text/csv; charset=utf-8"
        headers["Content-Disposition"] = 'attachment; filename="measurements.csv"'
        headers["Last-Modified"] = Time.zone.now.ctime.to_s
        self.response_body = @measurements.to_csv_enumerator
      end
    end
  end

  def full_ndt7_index
    @measurements = Measurement.where(style: "NDT7")
    authorize @measurements
    respond_to do |format|
      format.csv do
        headers["X-Accel-Buffering"] = "no"
        headers["Cache-Control"] = "no-cache"
        headers["Content-Type"] = "text/csv; charset=utf-8"
        headers["Content-Disposition"] = 'attachment; filename="measurements-extended.csv"'
        headers["Last-Modified"] = Time.zone.now.ctime.to_s
        self.response_body = @measurements.to_ndt7_csv_enumerator
      end
    end
  end

  def show
  end

  private
  def set_measurement
    @measurement = policy_scope(Measurement).find(params[:id])
  end
end