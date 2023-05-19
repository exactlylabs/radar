class AutonomousSystemOrg < ApplicationRecord
    has_many :autonomous_systems
    has_one :client_count_aggregate, :as => :aggregator
end
