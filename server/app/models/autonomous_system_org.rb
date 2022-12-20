class AutonomousSystemOrg < ApplicationRecord
    has_many :autonomous_systems
    validates :org_id, uniqueness: true
    has_one :client_count_aggregate, :as => :aggregator
end
