class Snapshot < ApplicationRecord
  belongs_to :event
  belongs_to :aggregate, polymorphic: true

  def self.last_from(aggregate)
    Snapshot.where(aggregate: aggregate).order("created_at DESC").first
  end
end