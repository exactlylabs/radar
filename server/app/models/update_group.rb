class UpdateGroup < ApplicationRecord
    has_many :clients, dependent: :nullify
    belongs_to :client_version, optional: false
end
