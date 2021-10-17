class Measurement < ApplicationRecord
  belongs_to :client
  has_one_attached :result
end
