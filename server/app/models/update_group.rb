class UpdateGroup < ApplicationRecord
    belongs_to :client_version, optional: false
end
