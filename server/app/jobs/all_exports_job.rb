require 'zip'

class AllExportsJob < ApplicationJob
  queue_as :default

  def perform(user, filename, origin)
    # Setup files for compressing
    ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 0})
    @locations = Location.all.to_csv_file
    @clients = Client.all.to_csv_file
    ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 25})
    @all_measurements = Measurement.all.to_csv_file
    @all_ndt7_measurements = Measurement.where(style: "NDT7").to_ndt7_csv_file
    ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 50})
    # Main zip for download
    Zip::File.open(filename, create: true) do |zip|

      # zip.add(filename, object, &continue_on_exists_proc)
      # By providing a block as the third parameter (outside the actual add method call) we define
      # the file to override if an already existing one is present. This might be the case if the
      # server/worker goes down, and then gets rebooted, when Sidekiq tries to restart the process where
      # it was left off, it could need to re-add the file, so we allow it to replace the contents if needed.
      # It is equivalent to initializing rubyzip in the initializers folder with Zip.continue_on_exists_proc = true
      # but to keep it strictly as a configuration for this specific use, I'm using it as a block here.
      # https://github.com/rubyzip/rubyzip/blob/master/README.md#:~:text=If%20you%27re%20using%20rubyzip%20with%20rails%2C%20consider%20placing%20this%20snippet%20of%20code%20in%20an%20initializer%20file%20such%20as%20config/initializers/rubyzip.rb

      zip.add("locations.csv", @locations) {true}
      ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 56})
      zip.add("clients.csv", @clients) {true}
      ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 62})
      zip.add("all_measurements.csv", @all_measurements) {true}
      ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 68})
      zip.add("all_ndt7_measurements.csv", @all_ndt7_measurements) {true}
    end
    ExportsChannel.broadcast_to(CHANNELS[:exports], {progress: 75})
    # Attach a new download for user (helps for later reference if needed)
    user.downloads.attach(io: File.open(filename), filename: filename, content_type: 'application/zip')

    # Remove from pending downloads array, to keep track of missing processing
    user.update(pending_downloads: user.pending_downloads.delete(filename))
    sleep 90
    # Send back file url to client in case they are online, to fire an automatic download
    url = Rails.application.routes.url_helpers.rails_blob_path(user.downloads.last, only_path: true)
    url = origin + url
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