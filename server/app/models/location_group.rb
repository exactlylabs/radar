class LocationGroup < ApplicationRecord
    belongs_to :location_label, optional: true
    has_many :locations, dependent: :nullify
end
