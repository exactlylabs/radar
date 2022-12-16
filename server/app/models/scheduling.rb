require "csv"

class Scheduling < ApplicationRecord
  belongs_to :client
  belongs_to :account, optional: true
  has_one_attached :result
end
