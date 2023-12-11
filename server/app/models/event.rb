class Event < ApplicationRecord
  belongs_to :aggregate, polymorphic: true
  has_one :snapshot

  scope :of, ->(model) { where(aggregate_type: model.name) }
  scope :from_aggregate, -> (obj) { where(aggregate: obj)}
  scope :prior_to_or_at, ->(timestamp) { where("timestamp <= ?", timestamp) }
  scope :prior_to, ->(timestamp) { where("timestamp < ?", timestamp) }
  scope :at, -> (timestamp) { where("timestamp = ?", timestamp) }
  scope :where_name_is, -> (*names) { where(name: names)}

  def self.last_version_from(aggregate)
    version = Event.where(aggregate: aggregate).order("version DESC").limit(1).pluck(:version)
    version.empty? ? 0 : version[0]
  end

  def self.last_version_from_type_id_set(aggregate_type, aggregate_id)
    version = Event.where(aggregate_type: aggregate_type, aggregate_id: aggregate_id).order("version DESC").limit(1).pluck(:version)
    version.empty? ? 0 : version[0]
  end

  def previous()
    if self.version > 1
      Event.find_by(aggregate: self.aggregate, version: self.version - 1)
    end
  end
end
