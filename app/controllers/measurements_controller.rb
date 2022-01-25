class MeasurementsController < ApplicationController
  before_action :authenticate_user!

  def index
    @measurements = current_user.measurements
    
    respond_to do |format|
      format.csv { send_data @measurements.to_csv, filename: "measurements.csv" }
    end
  end
end