class LocationGroup < ApplicationRecord
    has_many :locations, dependent: :nullify
end
