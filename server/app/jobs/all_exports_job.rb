require 'zip'

class AllExportsJob < ApplicationJob
  queue_as :default

  def perform(user, filename)
    # Setup files for compressing
    @locations = Location.all.to_csv_file
    @clients = Client.all.to_csv_file
    @all_measurements = Measurement.all.to_csv_file
    @all_ndt7_measurements = Measurement.where(style: "NDT7").to_ndt7_csv_file
    sleep 25
    # Main zip for download
    ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 0})
    Zip::File.open(filename, create: true) do |zip|
      zip.add("locations.csv", @locations)
      ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 25})
      zip.add("clients.csv", @clients)
      ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 50})
      zip.add("all_measurements.csv", @all_measurements)
      ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 75})
      zip.add("all_ndt7_measurements.csv", @all_ndt7_measurements)
    end

    # Attach a new download for user (helps for later reference if needed)
    user.downloads.attach(io: File.open(filename), filename: filename, content_type: 'application/zip')

    # Remove from pending downloads array, to keep track of missing processing
    user.update(pending_downloads: user.pending_downloads.delete(filename))

    # Send back file url to client in case they are online, to fire an automatic download
    url = Rails.application.routes.url_helpers.rails_blob_path(user.downloads.last, only_path: true)
    ExportsChannel.broadcast_to(CHANNELS[:exports], {url: url})

    # Send out complete progress indication once the url for the download has been exposed
    ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 100})

    # Delete file from storage in 1 day
    download_id = user.downloads.last.id
    PurgeDownloadJob.set(wait_until: Time.now + 24 * 60 * 60).perform_later(user, download_id)

    # Send download ready email
    ExportsMailer.with(user: user, url: url).export_ready_email.deliver_later
  end
end