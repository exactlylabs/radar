class Distribution < ApplicationRecord
    belongs_to :client_version
    has_one_attached :signed_binary
    has_one_attached :binary
end
