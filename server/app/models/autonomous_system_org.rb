class AutonomousSystemOrg < ApplicationRecord
    has_many :autonomous_systems
    has_and_belongs_to_many :geospaces
    has_one :client_count_aggregate, :as => :aggregator
    has_many :location_metadata_projections
end
