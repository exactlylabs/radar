class Study < ApplicationRecord
  has_and_belongs_to_many :geospaces
  has_many :study_aggregates

  validates :name, presence: true, uniqueness: true
  validates :completion_days, numericality: { only_integer: true, greater_than: 0 }
end
