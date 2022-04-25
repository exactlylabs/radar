class ClientVersion < ApplicationRecord
    has_many :clients, dependent: :nullify
    has_many :update_groups, dependent: :destroy
    
    has_one_attached :signed_binary

    def is_higher?(other)
        other.version.gsub(".", "").to_i < self.version.gsub(".", "").to_i
    end
end
