class UpdateGroup < ApplicationRecord
    has_many :clients, dependent: :nullify
    belongs_to :client_version, optional: true

    def self.default_group
        self.where(name: 'Default Group').first
    end
end
