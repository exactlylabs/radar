class Distribution < ApplicationRecord
    belongs_to :client_version
    has_one_attached :signed_binary
    has_one_attached :binary

    validates :binary, presence: true
    validates :signed_binary, presence: true
    validates :name, uniqueness: {scope: :client_version_id}
end
