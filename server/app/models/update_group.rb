class UpdateGroup < ApplicationRecord
    has_many :clients, dependent: :nullify
    belongs_to :client_version, optional: true
    belongs_to :watchdog_version, optional: true

    def self.default_group
        self.where(default: true).first
    end
end
