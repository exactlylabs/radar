class AutonomousSystemOrg < ApplicationRecord
    has_many :autonomous_systems
    has_and_belongs_to_many :geospaces
    has_one :client_count_aggregate, :as => :aggregator
    has_many :location_metadata_projections

    def self.find_by_ip(ip)
      AsnIpLookup.eager_load(:autonomous_system => :autonomous_system_org).where("? << ip", ip).order("masklen(ip) DESC").first&.autonomous_system&.autonomous_system_org
    end
end
