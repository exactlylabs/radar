Rails.application.reloader.to_prepare do
  # Don't know why, but without this the Channel.blob_path was throwing
  # Unable to autoload constant ActiveStorage::Blob::Analyzable
  # See: https://stackoverflow.com/questions/52358427/unable-to-autoload-constant-activestorageblobanalyzable-error-with-rails-5-2
  ActiveStorage::Blob
end