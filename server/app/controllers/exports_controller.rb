require "zip"

class ExportsController < ApplicationController
  before_action :ensure_exportuser!

  # GET /exports/all
  def all
    @locations = Location.all.to_csv
    @clients = Client.all.to_csv
    @all_measurements = Measurement.all.to_csv
    @all_ndt7_measurements = Measurement.where(style: "NDT7").to_csv
    # Do we want ookla on its own as well?
    # @all_ookla_measurements = Measurement.where(style: "OOKLA").to_csv

    begin
      Zip::File.open("tmp.zip", create: true) do |zip|
        zip.get_output_stream("locations.csv") { |f| f.puts(@locations) }
        zip.get_output_stream("clients.csv") { |f| f.puts(@clients) }
        zip.get_output_stream("all_measurements.csv") { |f| f.puts(@all_measurements) }
        zip.get_output_stream("all_ndt7_measurements.csv") { |f| f.puts(@all_ndt7_measurements) }
      end
    end
    zip_data = File.read("tmp.zip")
    respond_to do |format|
      format.zip { send_data zip_data, filename: "data.zip" }
    end
  end

  def locations
    respond_to do |format|
      format.csv { send_data Location.all.to_csv, filename: "locations.csv" }
    end
  end

  def clients
    respond_to do |format|
      format.csv { send_data Client.all.to_csv, filename: "clients.csv" }
    end
  end

  private
  def ensure_exportuser!
    if !current_user.exportuser
      head(403)
    end
  end

  def write_data(file, data)
    data.split('\n').each do |line|
      file.write(line)
    end
  end
end