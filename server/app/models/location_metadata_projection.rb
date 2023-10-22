class LocationMetadataProjection < ApplicationRecord
  has_one :location, -> { with_deleted }
  belongs_to :autonomous_system_org, optional: true

end
