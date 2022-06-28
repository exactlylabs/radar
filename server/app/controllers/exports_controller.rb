require "zip"

class ExportsController < ApplicationController
  before_action :authenticate_user!
  before_action :authenticate_token!
  before_action :ensure_exportuser!

  # GET /exports/all
  def all
    @locations = Location.all.to_csv_file
    @clients = Client.all.to_csv_file
    @all_measurements = Measurement.all.to_csv_file
    @all_ndt7_measurements = Measurement.where(style: "NDT7").to_ndt7_csv_file

    file_stream = Zip::OutputStream.write_buffer do |zos|
      zos.put_next_entry "locations.csv"
      zos << IO.read(@locations)
      zos.put_next_entry "clients.csv"
      zos << IO.read(@clients)
      zos.put_next_entry "all_measurements.csv"
      zos << IO.read(@all_measurements)
      zos.put_next_entry "all_ndt7_measurements.csv"
      zos << IO.read(@all_ndt7_measurements)
    end

    file_stream.rewind

    respond_to do |format|
      format.zip { send_data file_stream.read, type: :zip, disposition: :attachment, filename: "data-#{Time.now.to_i}.zip" }
    end
  end

  private
  def ensure_exportuser!
    if !current_user.exportuser
      head(403)
    end
  end

  def authenticate_token!
    if !request.headers["Authorization"].nil?
      token = request.headers["Authorization"].split(" ")
      if token.size == 2
        @user = User.where({"token": token[1]}).first
      end
    end
  end
end