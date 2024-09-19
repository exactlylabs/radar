class SchedulingRestriction < ApplicationRecord
  belongs_to :location

  validate :weekdays do
    if weekdays.any? { |w| !(0..6).include?(w) }
      errors.add(:weekdays, :invalid)
    end
  end
end
