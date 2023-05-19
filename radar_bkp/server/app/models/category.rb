class Category < ApplicationRecord
	has_and_belongs_to_many :locations
	belongs_to :account
end
