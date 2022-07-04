require "zip"

class ExportsController < ApplicationController
  before_action :authenticate_user!
  before_action :authenticate_token!

  # GET /exports/all
  def all
    @locations = Location.all.to_csv_file
    @clients = Client.all.to_csv_file
    @all_measurements = Measurement.all.to_csv_file
    @all_ndt7_measurements = Measurement.where(style: "NDT7").to_ndt7_csv_file
    authorize @locations, policy_class: ExportPolicy
    filename = "data-#{Time.now.to_i}.zip"
    zip_tmp_file = Tempfile.new(filename)
    Zip::File.open(zip_tmp_file.path, create: true) do |zip|
      zip.add("locations.csv", @locations)
      zip.add("clients.csv", @clients)
      zip.add("all_measurements.csv", @all_measurements)
      zip.add("all_ndt7_measurements.csv", @all_ndt7_measurements)
    end

    respond_to do |format|
      format.zip { send_file zip_tmp_file, type: :zip, disposition: :attachment, filename: filename }
    end
  end

  private

  def authenticate_token!
    if request.headers["Authorization"].present?
      token = request.headers["Authorization"].split(" ")
      if token.size == 2
        @user = User.where({"token": token[1]}).first
      end
    end
  end
end