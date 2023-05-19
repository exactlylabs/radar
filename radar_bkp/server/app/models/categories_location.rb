class CategoriesLocation < ApplicationRecord
  belongs_to :account
  belongs_to :location
  belongs_to :category
end