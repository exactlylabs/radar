class AutonomousSystem < ApplicationRecord
    belongs_to :autonomous_system_org
    has_many :clients
    has_many :measurements
    has_many :client_speed_tests
    validates :asn, uniqueness: true
end
