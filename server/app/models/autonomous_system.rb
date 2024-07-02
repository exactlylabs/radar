class AutonomousSystem < ApplicationRecord
    belongs_to :autonomous_system_org
    has_many :clients
    has_many :measurements
    has_many :client_speed_tests
    has_many :asn_ip_lookups
    validates :asn, uniqueness: true


    def self.find_by_ip(ip)
      AsnIpLookup.eager_load(:autonomous_system).where("? << ip", ip).order("masklen(ip) DESC").first&.autonomous_system
    end
end
