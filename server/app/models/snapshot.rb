class Snapshot < ApplicationRecord
  belongs_to :event
  belongs_to :aggregate, polymorphic: true

  scope :of, ->(model) { where(aggregate_type: model.name) }
  scope :from_aggregate, -> (obj) { where(aggregate: obj)}
  scope :prior_to_or_at, ->(timestamp) { joins(:event).where("timestamp <= ?", timestamp) }

  def self.last_from(aggregate)
    Snapshot.where(aggregate: aggregate).order("snapshots.aggregate_id, created_at DESC").first
  end

end