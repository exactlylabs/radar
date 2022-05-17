class ClientVersion < ApplicationRecord
    has_many :clients, dependent: :nullify
    has_many :update_groups, dependent: :restrict_with_exception
    has_many :distributions, dependent: :restrict_with_exception

    has_one_attached :signed_binary

    def is_higher?(other)
        other.version.gsub(".", "").to_i < self.version.gsub(".", "").to_i
    end

    def distribution_by_name(name)
        self.distributions.find_by(name: name)
    end

    def self.stable
        self.find_by_is_stable(true)
    end

end
