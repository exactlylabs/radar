class AllExportsJob < ApplicationJob
  queue_as :exports

  def perform(user)
    @locations = Location.all.to_csv_file
    @clients = Client.all.to_csv_file
    @all_measurements = Measurement.all.to_csv_file
    @all_ndt7_measurements = Measurement.where(style: "NDT7").to_ndt7_csv_file
    filename = "data-#{Time.now.to_i}.zip"
    Zip::File.open(filename, create: true) do |zip|
      zip.add("locations.csv", @locations)
      zip.add("clients.csv", @clients)
      i = 0
      zip.add("all_measurements#{i}.csv", @all_measurements)
      zip.add("all_ndt7_measurements.csv", @all_ndt7_measurements)
    end
    sleep 5
    user.downloads.attach(io: File.open(filename), filename: filename, content_type: 'application/zip')
    url = Rails.application.routes.url_helpers.rails_blob_path(user.downloads.last, only_path: true)
    ExportsChannel.broadcast_to(CHANNELS[:exports], url)
    ExportsMailer.with(user: user, url: url).export_ready_email.deliver_later
  end
end