module ApplicationCable
  class Channel < ActionCable::Channel::Base
    def self.blob_path(blob)
      Rails.application.routes.url_helpers.rails_blob_path(blob, only_path: true)
    end
  end
end
