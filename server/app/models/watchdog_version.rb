class WatchdogVersion < ApplicationRecord
    has_many :clients, dependent: :nullify
    has_many :update_groups, dependent: :restrict_with_exception
    validates :version, uniqueness: true, presence: true, format: {with: /\A(?:\d+\.){2}\d+(?:r\d+)?\z/}

    has_one_attached :signed_binary
    has_one_attached :binary

    validates :binary, presence: true
    validates :signed_binary, presence: true

    def self.stable
        self.find_by_is_stable(true)
    end
end
