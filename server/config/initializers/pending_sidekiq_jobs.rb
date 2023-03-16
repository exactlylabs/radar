# Make sure all other initializers have ran, mainly to have access
# to models and jobs
Rails.configuration.after_initialize do
  users_with_pending_users = User.where("pending_downloads IS NOT NULL AND array_length(pending_downloads, 1) > 0")
  if users_with_pending_users.present? && users_with_pending_users.length > 0
    users_with_pending_users.each do |user|
      user.pending_downloads.each do |filename|
        origin = ENV['BASE_URL'] || "http://localhost:3000"
        AllExportsJob.perform_later user, filename, origin
      end
    end
  end
end