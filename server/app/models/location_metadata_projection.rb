class LocationMetadataProjection < ApplicationRecord
  belongs_to :location, -> { with_deleted }
  belongs_to :autonomous_system_org, optional: true

end
