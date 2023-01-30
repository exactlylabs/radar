class LocationLabel < ApplicationRecord
    has_many :locations, dependent: :nullify
end
