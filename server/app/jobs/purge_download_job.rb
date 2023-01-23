class PurgeDownloadJob < ApplicationJob
  queue_as :default

  def perform(user, download_id)
    file = user.downloads.find(download_id)
    file.purge if file
  end
end