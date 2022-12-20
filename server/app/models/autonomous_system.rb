class AutonomousSystem < ApplicationRecord
    belongs_to :autonomous_system_org
    has_many :clients
    has_many :measurements
    validates :asn, uniqueness: true
end
